from __future__ import annotations

import os
import re
import sys
import unicodedata
from datetime import date
from typing import TypedDict

import streamlit as st
from supabase import Client

# Allow importing fluxcash core from parent directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fluxcash.core.processor import TransactionProcessor
from models.schemas import DashboardSummary, TransactionCreate, TransactionRecord

# ---------------------------------------------------------------------------
# Regex para detectar a tag #conjunto na descrição (case-insensitive)
# ---------------------------------------------------------------------------
_CONJUNTO_RE = re.compile(r"#conjunto\b", re.IGNORECASE)


class ProcessedTransaction(TypedDict):
    """Resultado intermediário de process_transaction antes de persistir."""
    value: float
    description: str
    category: str
    scope: str          # 'shared' | 'personal'
    investment_type: str  # 'Conjunto' | 'Individual' | 'N/A'


def _normalize(text: str) -> str:
    """Remove acentos e converte para minúsculas."""
    nfkd = unicodedata.normalize("NFKD", text)
    return nfkd.encode("ASCII", "ignore").decode("ASCII").lower().strip()


# Mapa de palavras-chave → categoria (espelha TransactionProcessor.CATEGORY_MAP)
_CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "Alimentação":  ["mercado", "supermercado", "restaurante", "lanche",
                     "ifood", "padaria", "acougue", "feira"],
    "Transporte":   ["uber", "99", "onibus", "metro", "gasolina",
                     "combustivel", "estacionamento", "pedagio"],
    "Saúde":        ["farmacia", "medico", "consulta", "hospital",
                     "plano de saude", "exame", "dentista"],
    "Educação":     ["curso", "faculdade", "livro", "escola",
                     "mensalidade", "udemy", "alura", "treinamento"],
    "Lazer":        ["cinema", "netflix", "spotify", "show",
                     "viagem", "hotel", "jogo", "streaming"],
    "Moradia":      ["aluguel", "condominio", "agua", "luz",
                     "energia", "internet", "gas", "iptu"],
    "Investimento": ["tesouro", "acoes", "fundo", "cdb",
                     "poupanca", "cripto", "dividendo", "acao"],
    "Receita":      ["salario", "freelance", "renda", "pagamento",
                     "transferencia recebida", "bonus"],
}


def suggest_category(description: str) -> str:
    """
    Sugere uma categoria com base em palavras-chave na descrição.

    Retorna 'Outros' quando nenhuma keyword corresponde.
    Complexidade: O(C × K) — aceitável para uso interativo.
    """
    normalized = _normalize(description)
    for category, keywords in _CATEGORY_KEYWORDS.items():
        if any(kw in normalized for kw in keywords):
            return category
    return "Outros"


def process_transaction(
    value: float,
    description: str,
    transaction_type: str,
    category: str = "Outros",
    investment_type: str = "N/A",
) -> ProcessedTransaction:
    """
    Valida e enriquece os dados de uma transação antes de persistir.

    Regras:
      1. value deve ser > 0 (ValueError caso contrário).
      2. Se a descrição contiver a tag #conjunto (regex), scope = 'shared'
         e investment_type é promovido para 'Conjunto'.
      3. Se category == 'Outros', aplica suggest_category() automaticamente.

    Retorna um ProcessedTransaction com todos os campos resolvidos.
    """
    if value <= 0:
        raise ValueError(f"O valor deve ser positivo. Recebido: {value}")

    # Detecta tag #conjunto via regex
    is_shared = bool(_CONJUNTO_RE.search(description))
    scope = "shared" if is_shared else "personal"

    # Promove investment_type quando tag detectada
    resolved_investment_type = "Conjunto" if is_shared else investment_type

    # Categorização automática
    resolved_category = suggest_category(description) if category == "Outros" else category

    return ProcessedTransaction(
        value=round(value, 2),
        description=description,
        category=resolved_category,
        scope=scope,
        investment_type=resolved_investment_type,
    )


class TransactionService:
    def __init__(self, client: Client) -> None:
        self._db = client
        self._processor = TransactionProcessor()

    @st.cache_data(ttl=60)
    def fetch_transactions(
        _self,
        start_date: date | None = None,
        end_date: date | None = None,
        transaction_type: str | None = None,
        category: str | None = None,
    ) -> list[TransactionRecord]:
        """
        Busca transações com filtros opcionais.

        Precondições:
          - start_date <= end_date se ambos fornecidos.
        Pós-condições:
          - Retorna lista ordenada por timestamp DESC.
          - Lista vazia se nenhum resultado.
        """
        query = _self._db.table("transactions").select("*").order("timestamp", desc=True)

        if start_date:
            query = query.gte("timestamp", start_date.isoformat())
        if end_date:
            query = query.lte("timestamp", f"{end_date.isoformat()}T23:59:59")
        if transaction_type:
            query = query.eq("type", transaction_type)
        if category:
            query = query.eq("category", category)

        response = query.limit(500).execute()
        return [TransactionRecord(**row) for row in (response.data or [])]

    def create_transaction(self, payload: TransactionCreate) -> TransactionRecord:
        """
        Valida, enriquece e persiste nova transação.

        Usa process_transaction() para:
          - Validar value > 0
          - Detectar tag #conjunto e definir scope/investment_type
          - Sugerir categoria automaticamente se 'Outros'

        Pós-condições:
          - Registro inserido no Supabase com id e timestamp gerados.
          - Cache invalidado via st.cache_data.clear().
        """
        processed = process_transaction(
            value=payload.value,
            description=payload.description,
            transaction_type=payload.type,
            category=payload.category,
            investment_type=payload.investment_type,
        )

        data = payload.model_dump()
        data["category"] = processed["category"]
        data["investment_type"] = processed["investment_type"]

        response = self._db.table("transactions").insert(data).execute()
        st.cache_data.clear()
        return TransactionRecord(**response.data[0])

    def delete_transaction(self, transaction_id: str) -> None:
        """
        Remove transação por ID.

        Pós-condições:
          - Registro removido do Supabase.
          - Cache invalidado.
        """
        self._db.table("transactions").delete().eq("id", transaction_id).execute()
        st.cache_data.clear()

    @st.cache_data(ttl=60)
    def fetch_summary(
        _self,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> DashboardSummary:
        """
        Agrega totais para o período.

        Pós-condições:
          - balance == total_income - total_expense
          - sum(expense_by_category.values()) == total_expense
        """
        transactions = _self.fetch_transactions(start_date, end_date)

        total_income = sum(t.value for t in transactions if t.type == "receita")
        total_expense = sum(t.value for t in transactions if t.type == "despesa")
        total_investment = sum(
            t.value for t in transactions
            if t.investment_type in ("Individual", "Conjunto")
        )

        expense_by_category: dict[str, float] = {}
        income_by_category: dict[str, float] = {}

        for t in transactions:
            if t.type == "despesa":
                expense_by_category[t.category] = (
                    expense_by_category.get(t.category, 0.0) + t.value
                )
            else:
                income_by_category[t.category] = (
                    income_by_category.get(t.category, 0.0) + t.value
                )

        return DashboardSummary(
            total_income=total_income,
            total_expense=total_expense,
            balance=total_income - total_expense,
            total_investment=total_investment,
            expense_by_category=expense_by_category,
            income_by_category=income_by_category,
            period_start=start_date,
            period_end=end_date,
        )
