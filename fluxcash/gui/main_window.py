"""Janela principal do FluxCash."""

from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QCheckBox,
    QComboBox,
    QFrame,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QMainWindow,
    QMessageBox,
    QPushButton,
    QSizePolicy,
    QVBoxLayout,
    QWidget,
)

from fluxcash.core.models import Summary, Transaction, TransactionType
from fluxcash.core.processor import TransactionProcessor
from fluxcash.gui.theme import COLORS
from fluxcash.gui.transaction_table import TransactionTable
from fluxcash.gui.widgets import Divider, SummaryCard


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("FluxCash 💸")
        self.setMinimumSize(960, 620)

        self._processor = TransactionProcessor()
        self._summary = Summary()
        self._processor.subscribe(self._on_transaction)

        central = QWidget()
        self.setCentralWidget(central)
        root = QVBoxLayout(central)
        root.setContentsMargins(20, 20, 20, 20)
        root.setSpacing(16)

        root.addWidget(self._build_header())
        root.addWidget(Divider())

        body = QHBoxLayout()
        body.setSpacing(16)
        body.addWidget(self._build_form(), stretch=0)
        body.addWidget(self._build_table(), stretch=1)
        root.addLayout(body)

        root.addWidget(Divider())
        root.addWidget(self._build_summary_bar())

    # ------------------------------------------------------------------
    # Builders
    # ------------------------------------------------------------------

    def _build_header(self) -> QWidget:
        w = QWidget()
        layout = QHBoxLayout(w)
        layout.setContentsMargins(0, 0, 0, 0)

        title = QLabel("FluxCash")
        title.setObjectName("title")

        subtitle = QLabel("Gestor Financeiro Pessoal")
        subtitle.setObjectName("subtitle")
        subtitle.setAlignment(Qt.AlignmentFlag.AlignBottom)

        layout.addWidget(title)
        layout.addWidget(subtitle)
        layout.addStretch()
        return w

    def _build_form(self) -> QFrame:
        frame = QFrame()
        frame.setObjectName("card")
        frame.setFixedWidth(260)

        layout = QVBoxLayout(frame)
        layout.setContentsMargins(16, 16, 16, 16)
        layout.setSpacing(10)

        section = QLabel("Nova Transação")
        section.setObjectName("section_title")
        layout.addWidget(section)
        layout.addWidget(Divider())

        # Descrição
        layout.addWidget(self._field_label("Descrição"))
        self._input_desc = QLineEdit()
        self._input_desc.setPlaceholderText("Ex: Mercado, Salário...")
        layout.addWidget(self._input_desc)

        # Valor
        layout.addWidget(self._field_label("Valor (R$)"))
        self._input_value = QLineEdit()
        self._input_value.setPlaceholderText("0,00")
        layout.addWidget(self._input_value)

        # Tipo
        layout.addWidget(self._field_label("Tipo"))
        self._combo_type = QComboBox()
        self._combo_type.addItems(["↑ Receita", "↓ Despesa"])
        layout.addWidget(self._combo_type)

        # Conjunto
        self._check_joint = QCheckBox("Transação Conjunta")
        layout.addWidget(self._check_joint)

        layout.addStretch()

        # Botões
        self._btn_add = QPushButton("Adicionar")
        self._btn_add.setObjectName("btn_add")
        self._btn_add.setCursor(Qt.CursorShape.PointingHandCursor)
        self._btn_add.clicked.connect(self._handle_add)

        self._btn_clear = QPushButton("Limpar Tudo")
        self._btn_clear.setObjectName("btn_clear")
        self._btn_clear.setCursor(Qt.CursorShape.PointingHandCursor)
        self._btn_clear.clicked.connect(self._handle_clear)

        layout.addWidget(self._btn_add)
        layout.addWidget(self._btn_clear)

        return frame

    def _build_table(self) -> QFrame:
        frame = QFrame()
        frame.setObjectName("card")
        layout = QVBoxLayout(frame)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        header = QWidget()
        header.setStyleSheet(f"background: transparent;")
        h_layout = QHBoxLayout(header)
        h_layout.setContentsMargins(16, 12, 16, 8)

        label = QLabel("Transações")
        label.setObjectName("section_title")
        h_layout.addWidget(label)
        h_layout.addStretch()

        self._count_label = QLabel("0 registros")
        self._count_label.setObjectName("subtitle")
        h_layout.addWidget(self._count_label)

        layout.addWidget(header)

        self._table = TransactionTable()
        layout.addWidget(self._table)
        return frame

    def _build_summary_bar(self) -> QWidget:
        w = QWidget()
        layout = QHBoxLayout(w)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(12)

        self._card_income  = SummaryCard("Receitas",  COLORS["neon_green"])
        self._card_expense = SummaryCard("Despesas",  COLORS["neon_red"])
        self._card_balance = SummaryCard("Saldo",     COLORS["neon_blue"])

        layout.addWidget(self._card_income)
        layout.addWidget(self._card_expense)
        layout.addWidget(self._card_balance)
        layout.addStretch()
        return w

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _field_label(text: str) -> QLabel:
        lbl = QLabel(text)
        lbl.setStyleSheet(f"color: {COLORS['text_muted']}; font-size: 11px;")
        return lbl

    def _update_summary(self) -> None:
        self._card_income.set_value(self._summary.total_income)
        self._card_expense.set_value(self._summary.total_expense)
        self._card_balance.set_value(self._summary.balance)
        self._count_label.setText(f"{len(self._summary.transactions)} registro(s)")

    # ------------------------------------------------------------------
    # Slots
    # ------------------------------------------------------------------

    def _on_transaction(self, transaction: Transaction) -> None:
        """Callback do Observer — atualiza tabela e cards."""
        self._summary.transactions.append(transaction)
        self._table.add_transaction(transaction)
        self._update_summary()

    def _handle_add(self) -> None:
        description = self._input_desc.text().strip()
        raw_value   = self._input_value.text().strip().replace(",", ".")

        if not description:
            self._shake(self._input_desc)
            return

        try:
            value = float(raw_value)
            if value <= 0:
                raise ValueError
        except ValueError:
            self._shake(self._input_value)
            return

        t_type = (
            TransactionType.RECEITA
            if self._combo_type.currentIndex() == 0
            else TransactionType.DESPESA
        )

        self._processor.process(
            value=value,
            description=description,
            transaction_type=t_type,
            is_joint_flag=self._check_joint.isChecked(),
        )

        # Limpa o formulário
        self._input_desc.clear()
        self._input_value.clear()
        self._check_joint.setChecked(False)
        self._input_desc.setFocus()

    def _handle_clear(self) -> None:
        if not self._summary.transactions:
            return
        reply = QMessageBox.question(
            self,
            "Limpar tudo",
            "Deseja remover todas as transações?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
        )
        if reply == QMessageBox.StandardButton.Yes:
            self._summary.transactions.clear()
            self._table.clear_all()
            self._update_summary()

    @staticmethod
    def _shake(widget: QWidget) -> None:
        """Destaca o campo com borda vermelha brevemente."""
        widget.setStyleSheet(
            f"background-color: {COLORS['bg_input']};"
            f"border: 1px solid {COLORS['neon_red']};"
            f"border-radius: 6px; padding: 6px 10px;"
        )
        from PySide6.QtCore import QTimer
        QTimer.singleShot(
            800,
            lambda: widget.setStyleSheet(
                f"background-color: {COLORS['bg_input']};"
                f"border: 1px solid {COLORS['border']};"
                f"border-radius: 6px; padding: 6px 10px;"
            ),
        )
