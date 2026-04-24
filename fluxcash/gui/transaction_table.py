"""Tabela de transações usando QTableWidget."""

from PySide6.QtCore import Qt
from PySide6.QtGui import QColor
from PySide6.QtWidgets import QTableWidget, QTableWidgetItem, QHeaderView

from fluxcash.core.models import Transaction, TransactionType
from fluxcash.gui.theme import COLORS

HEADERS = ["Data", "Descrição", "Categoria", "Tipo", "Investimento", "Valor"]


class TransactionTable(QTableWidget):
    def __init__(self, parent=None) -> None:
        super().__init__(0, len(HEADERS), parent)

        self.setHorizontalHeaderLabels(HEADERS)
        self.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers)
        self.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.setAlternatingRowColors(False)
        self.verticalHeader().setVisible(False)
        self.setShowGrid(True)

        header = self.horizontalHeader()
        header.setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        header.setSectionResizeMode(2, QHeaderView.ResizeMode.ResizeToContents)
        header.setSectionResizeMode(3, QHeaderView.ResizeMode.ResizeToContents)
        header.setSectionResizeMode(4, QHeaderView.ResizeMode.ResizeToContents)
        header.setSectionResizeMode(5, QHeaderView.ResizeMode.ResizeToContents)

    def add_transaction(self, t: Transaction) -> None:
        row = self.rowCount()
        self.insertRow(row)

        is_income = t.transaction_type == TransactionType.RECEITA
        value_color = QColor(COLORS["neon_green"]) if is_income else QColor(COLORS["neon_red"])
        value_prefix = "+ " if is_income else "- "

        cells = [
            t.timestamp.strftime("%d/%m/%Y %H:%M"),
            t.description,
            t.category,
            "↑ Receita" if is_income else "↓ Despesa",
            t.investment_type.value,
            f"{value_prefix}R$ {t.value:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."),
        ]

        for col, text in enumerate(cells):
            item = QTableWidgetItem(text)
            item.setTextAlignment(Qt.AlignmentFlag.AlignVCenter | Qt.AlignmentFlag.AlignLeft)
            if col == 5:
                item.setForeground(value_color)
                item.setTextAlignment(Qt.AlignmentFlag.AlignVCenter | Qt.AlignmentFlag.AlignRight)
            self.setItem(row, col, item)

        self.scrollToBottom()

    def clear_all(self) -> None:
        self.setRowCount(0)
