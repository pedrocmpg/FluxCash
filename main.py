"""
FluxCash — Entry Point

Escolha o modo de execução:
  python main.py        → GUI (PySide6)
  python main.py --cli  → Terminal
"""

import sys


def run_cli() -> None:
    from fluxcash.cli.interface import (
        print_transaction,
        prompt_description,
        prompt_is_joint,
        prompt_transaction_type,
        prompt_value,
    )
    from fluxcash.core import Summary, TransactionProcessor

    processor = TransactionProcessor()
    summary = Summary()
    processor.subscribe(print_transaction)
    processor.subscribe(summary.transactions.append)  # type: ignore[arg-type]

    print("\n🚀 FluxCash — Gestor Financeiro (CLI)")
    print("   Digite 'sair' na descrição para encerrar.\n")

    while True:
        print("─" * 35)
        description = prompt_description()
        if description.lower() == "sair":
            break
        processor.process(
            value=prompt_value(),
            description=description,
            transaction_type=prompt_transaction_type(),
            is_joint_flag=prompt_is_joint(),
        )

    print(summary.display())


def run_gui() -> None:
    from fluxcash.gui.app import run
    run()


if __name__ == "__main__":
    if "--cli" in sys.argv:
        run_cli()
    else:
        run_gui()
