"""Inicializa a aplicação PySide6."""

import sys

from PySide6.QtWidgets import QApplication

from fluxcash.gui.main_window import MainWindow
from fluxcash.gui.theme import STYLESHEET


def run() -> None:
    app = QApplication(sys.argv)
    app.setStyleSheet(STYLESHEET)

    window = MainWindow()
    window.show()

    sys.exit(app.exec())
