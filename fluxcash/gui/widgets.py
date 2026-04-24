"""Widgets reutilizáveis do FluxCash."""

from PySide6.QtCore import Qt
from PySide6.QtWidgets import QFrame, QLabel, QVBoxLayout

from fluxcash.gui.theme import COLORS


class SummaryCard(QFrame):
    """Card que exibe um valor financeiro com label e cor de destaque."""

    def __init__(self, label: str, color: str, parent=None) -> None:
        super().__init__(parent)
        self.setObjectName("card")
        self.setMinimumWidth(160)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(16, 12, 16, 12)
        layout.setSpacing(4)

        self._label = QLabel(label.upper())
        self._label.setObjectName("section_title")

        self._value = QLabel("R$ 0,00")
        self._value.setStyleSheet(f"font-size: 22px; font-weight: bold; color: {color};")
        self._value.setAlignment(Qt.AlignmentFlag.AlignLeft)

        layout.addWidget(self._label)
        layout.addWidget(self._value)

    def set_value(self, amount: float) -> None:
        self._value.setText(f"R$ {amount:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))


class Divider(QFrame):
    """Linha horizontal de separação."""

    def __init__(self, parent=None) -> None:
        super().__init__(parent)
        self.setFrameShape(QFrame.Shape.HLine)
        self.setStyleSheet(f"color: {COLORS['border']}; background: {COLORS['border']}; max-height: 1px;")
