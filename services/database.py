"""
services/database.py
Camada de acesso a dados com tratamento de erros e feedback via st.toast.
"""
from __future__ import annotations

from datetime import date
from uuid import UUID

import streamlit as st
from supabase import Client, PostgrestAPIError

from models.schemas import DashboardSummary, TransactionCreate, TransactionRecord
from services.supabase_client import get_supabase
from services.transaction_service import process_transaction


# ---------------------------------------------------------------------------
# Helpers internos
# ---------------------------------------------------------------------------

def _get_client() -> Client | None:
    """
    Retorna o cliente Supabase ou exibe st.error amigável se a conexão falhar.
    Retorna None em caso de falha para que o chamador possa abortar graciosamente.
    """
    try:
        return get_supabase()
    except (KeyError, Exception) as exc:
        st.error(
            "🔴 Não foi possível conectar ao banco de dados. "
            "Verifique as credenciais do Supabase e tente novamente."
        )
        return None


def _handle_db_error(exc: Exception, context: str = "") -> None:
    """Exibe mensagem amigável ao usuário."""
    st.error(
        f"🔴 Erro ao {context}. "
        "Tente novamente em instantes ou contate o suporte."
    )


# ---------------------------------------------------------------------------
# CRUD público
# ---------------------------------------------------------------------------

def get_transactions(
    user_id: str | UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    transaction_type: str | None = None,
    investment_type: str | None = None,
    category: str | None = None,
    limit: int = 500,
) -> list[TransactionRecord]:
    """
    Busca transações filtradas por user_id e parâmetros opcionais.

    Pós-condições:
      - Retorna lista ordenada por timestamp DESC.
      - Lista vazia se nenhum resultado ou em caso de falha.
      - Exibe st.error amigável em caso de falha de conexão ou query.
    """
    client = _get_client()
    if client is None:
        return []

    try:
        query = client.table("transactions").select("*").order("timestamp", desc=True)

        if user_id:
            query = query.eq("user_id", str(user_id))
        if start_date:
            query = query.gte("timestamp", start_date.isoformat())
        if end_date:
            query = query.lte("timestamp", f"{end_date.isoformat()}T23:59:59")
        if transaction_type:
            query = query.eq("type", transaction_type)
        if investment_type and investment_type != "Todas":
            query = query.eq("investment_type", investment_type)
        if category:
            query = query.eq("category", category)

        response = query.limit(limit).execute()
        return [TransactionRecord(**row) for row in (response.data or [])]

    except PostgrestAPIError as exc:
        _handle_db_error(exc, "carregar as transações")
    except Exception as exc:
        _handle_db_error(exc, "conectar ao banco de dados")

    return []


def insert_transaction(payload: TransactionCreate) -> TransactionRecord | None:
    """
    Valida, enriquece e insere uma transação.
    Exibe st.toast de sucesso ou st.error em caso de falha.

    Pós-condições:
      - Registro inserido com id e timestamp gerados pelo Supabase.
      - st.toast exibido com categoria e scope resolvidos.
    """
    client = _get_client()
    if client is None:
        return None

    try:
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

        response = client.table("transactions").insert(data).execute()
        record = TransactionRecord(**response.data[0])

        scope_icon = "🤝" if record.investment_type == "Conjunto" else "👤"
        st.toast(
            f"{scope_icon} Transação gravada com sucesso! "
            f"**{record.category}** · R$ {record.value:,.2f}",
            icon="✅",
        )
        st.cache_data.clear()
        return record

    except ValueError as exc:
        st.warning(str(exc))
    except PostgrestAPIError as exc:
        _handle_db_error(exc, "gravar a transação")
    except Exception as exc:
        _handle_db_error(exc, "conectar ao banco de dados")

    return None


def delete_transaction(transaction_id: str) -> bool:
    """
    Remove transação por ID.
    Retorna True em caso de sucesso, False em caso de erro.
    """
    client = _get_client()
    if client is None:
        return False

    try:
        client.table("transactions").delete().eq("id", transaction_id).execute()
        st.toast("Transação removida.", icon="🗑️")
        st.cache_data.clear()
        return True
    except PostgrestAPIError as exc:
        _handle_db_error(exc, "remover a transação")
    except Exception as exc:
        _handle_db_error(exc, "conectar ao banco de dados")

    return False


def get_summary(
    user_id: str | UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    investment_type: str | None = None,
) -> DashboardSummary:
    """
    Agrega totais para o período e filtro de investment_type.

    Pós-condições:
      - balance == total_income - total_expense
      - sum(expense_by_category.values()) == total_expense
    """
    transactions = get_transactions(
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
        investment_type=investment_type,
    )

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
