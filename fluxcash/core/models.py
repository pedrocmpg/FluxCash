"""
Modelos de dados do FluxCash.

Dataclasses garantem:
  - Serialização futura simples (JSON/SQLite).
  - Compatibilidade direta com QAbstractTableModel do PySide6.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class TransactionType(str, Enum):
    RECEITA = "receita"
    DESPESA = "despesa"


class InvestmentType(str, Enum):
    INDIVIDUAL = "Individual"
    CONJUNTO = "Conjunto"
    NAO_APLICAVEL = "N/A"


@dataclass
class Transaction:
    value: float
    description: str
    category: str
    transaction_type: TransactionType
    investment_type: InvestmentType = InvestmentType.NAO_APLICAVEL
    timestamp: datetime = field(default_factory=datetime.now)

    @property
    def signed_value(self) -> float:
        """Valor com sinal: positivo para receita, negativo para despesa."""
        return self.value if self.transaction_type == TransactionType.RECEITA else -self.value


@dataclass
class Summary:
    transactions: list[Transaction] = field(default_factory=list)

    @property
    def balance(self) -> float:
        return sum(t.signed_value for t in self.transactions)

    @property
    def total_income(self) -> float:
        return sum(
            t.value for t in self.transactions
            if t.transaction_type == TransactionType.RECEITA
        )

    @property
    def total_expense(self) -> float:
        return sum(
            t.value for t in self.transactions
            if t.transaction_type == TransactionType.DESPESA
        )

    def display(self) -> str:
        lines = [
            "\n╔══════════════════════════════╗",
            "║        RESUMO FLUXCASH       ║",
            "╠══════════════════════════════╣",
            f"║  Receitas : R$ {self.total_income:>12.2f}  ║",
            f"║  Despesas : R$ {self.total_expense:>12.2f}  ║",
            f"║  Saldo    : R$ {self.balance:>12.2f}  ║",
            "╚══════════════════════════════╝",
        ]
        return "\n".join(lines)
