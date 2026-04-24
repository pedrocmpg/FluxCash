"""
Interface de linha de comando do FluxCash.

Responsabilidade única: I/O com o usuário.
Toda lógica de negócio permanece em core/.
"""

from fluxcash.core.models import Transaction, TransactionType


def print_transaction(transaction: Transaction) -> None:
    """Callback do Observer — exibe confirmação após cada transação."""
    arrow = "↑" if transaction.transaction_type == TransactionType.RECEITA else "↓"
    tipo = transaction.transaction_type.value.upper()
    print(
        f"  [{arrow} {tipo}] "
        f"{transaction.category} | "
        f"{transaction.investment_type.value} | "
        f"R$ {transaction.value:.2f}"
    )


def prompt_description() -> str:
    return input("  Descrição: ").strip()


def prompt_value() -> float:
    while True:
        try:
            raw = input("  Valor (R$): ").strip().replace(",", ".")
            return float(raw)
        except ValueError:
            print("  Valor inválido. Use números (ex: 150.00 ou 150,00).")


def prompt_transaction_type() -> TransactionType:
    while True:
        choice = input("  Tipo (1 = Receita / 2 = Despesa): ").strip()
        if choice == "1":
            return TransactionType.RECEITA
        if choice == "2":
            return TransactionType.DESPESA
        print("  Opção inválida. Digite 1 ou 2.")


def prompt_is_joint() -> bool:
    answer = input("  Transação conjunta? (s/N): ").strip().lower()
    return answer == "s"
