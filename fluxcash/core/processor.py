"""
Motor de categorização e processamento de transações.

Padrão Observer (subscribe/notify):
  - Na CLI: callbacks simples.
  - Na GUI: trocar por Signal(Transaction).connect() do PySide6
    sem alterar nada nesta classe.
"""

import unicodedata
from typing import Callable

from fluxcash.core.models import InvestmentType, Transaction, TransactionType

# Espelha a assinatura de Signal(Transaction) do PySide6
TransactionCallback = Callable[[Transaction], None]


class TransactionProcessor:
    """
    Categoriza transações automaticamente por palavras-chave.

    Estrutura de dados — dict[str, list[str]] (Categoria → Keywords):
      - Lookup O(1) por categoria; varredura O(k) nas keywords.
      - Manutenção simples: nova categoria = nova chave.
      - Alternativa inversa (keyword → categoria) seria mais rápida no
        categorize(), mas criaria duplicação e dificultaria manutenção.
        Para o volume de um app pessoal, a escolha atual é a ideal.
    """

    JOINT_KEYWORDS: frozenset[str] = frozenset({
        "conjunto", "compartilhado", "familia", "casal",
    })

    CATEGORY_MAP: dict[str, list[str]] = {
        "Alimentação":  ["mercado", "supermercado", "restaurante", "lanche",
                         "ifood", "padaria", "acougue"],
        "Transporte":   ["uber", "99", "onibus", "metro", "gasolina",
                         "combustivel", "estacionamento"],
        "Saúde":        ["farmacia", "medico", "consulta", "hospital",
                         "plano de saude", "exame"],
        "Educação":     ["curso", "faculdade", "livro", "escola",
                         "mensalidade", "udemy", "alura"],
        "Lazer":        ["cinema", "netflix", "spotify", "show",
                         "viagem", "hotel", "jogo"],
        "Moradia":      ["aluguel", "condominio", "agua", "luz",
                         "energia", "internet", "gas"],
        "Investimento": ["tesouro", "acoes", "fundo", "cdb",
                         "poupanca", "cripto", "dividendo"],
        "Receita":      ["salario", "freelance", "renda", "pagamento",
                         "transferencia recebida"],
        "Outros":       [],
    }

    def __init__(self) -> None:
        self._callbacks: list[TransactionCallback] = []

    # ------------------------------------------------------------------
    # Observer interface
    # ------------------------------------------------------------------

    def subscribe(self, callback: TransactionCallback) -> None:
        """Registra um listener. Na GUI: Signal(Transaction).connect()."""
        self._callbacks.append(callback)

    def _notify(self, transaction: Transaction) -> None:
        for callback in self._callbacks:
            callback(transaction)

    # ------------------------------------------------------------------
    # Lógica de negócio
    # ------------------------------------------------------------------

    @staticmethod
    def normalize(text: str) -> str:
        """Remove acentos e converte para minúsculas."""
        nfkd = unicodedata.normalize("NFKD", text)
        return nfkd.encode("ASCII", "ignore").decode("ASCII").lower().strip()

    def categorize(self, description: str) -> str:
        """Retorna a categoria da descrição. Complexidade: O(C × K)."""
        normalized = self.normalize(description)
        for category, keywords in self.CATEGORY_MAP.items():
            if any(kw in normalized for kw in keywords):
                return category
        return "Outros"

    def detect_investment_type(
        self,
        description: str,
        is_joint_flag: bool = False,
    ) -> InvestmentType:
        """
        Detecta se a transação é Individual ou Conjunta.
        Prioridade: flag explícita > palavra-chave na descrição.
        """
        if is_joint_flag:
            return InvestmentType.CONJUNTO

        if any(kw in self.normalize(description) for kw in self.JOINT_KEYWORDS):
            return InvestmentType.CONJUNTO

        return InvestmentType.INDIVIDUAL

    def process(
        self,
        value: float,
        description: str,
        transaction_type: TransactionType,
        is_joint_flag: bool = False,
    ) -> Transaction:
        """Cria, notifica e retorna uma Transaction processada."""
        transaction = Transaction(
            value=abs(value),
            description=description,
            category=self.categorize(description),
            transaction_type=transaction_type,
            investment_type=self.detect_investment_type(description, is_joint_flag),
        )
        self._notify(transaction)
        return transaction
