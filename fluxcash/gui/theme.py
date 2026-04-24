"""Paleta de cores e stylesheet global do FluxCash (Dark/Neon)."""

COLORS = {
    "bg_dark":    "#0d1117",
    "bg_card":    "#161b22",
    "bg_input":   "#21262d",
    "border":     "#30363d",
    "neon_green": "#39d353",
    "neon_red":   "#f85149",
    "neon_blue":  "#58a6ff",
    "neon_purple":"#bc8cff",
    "text":       "#e6edf3",
    "text_muted": "#8b949e",
}

STYLESHEET = f"""
/* ── Base ── */
QWidget {{
    background-color: {COLORS['bg_dark']};
    color: {COLORS['text']};
    font-family: 'Segoe UI', sans-serif;
    font-size: 13px;
}}

/* ── Cards / painéis ── */
QFrame#card {{
    background-color: {COLORS['bg_card']};
    border: 1px solid {COLORS['border']};
    border-radius: 8px;
}}

/* ── Inputs ── */
QLineEdit, QComboBox {{
    background-color: {COLORS['bg_input']};
    border: 1px solid {COLORS['border']};
    border-radius: 6px;
    padding: 6px 10px;
    color: {COLORS['text']};
}}
QLineEdit:focus, QComboBox:focus {{
    border-color: {COLORS['neon_blue']};
}}
QComboBox::drop-down {{ border: none; }}
QComboBox QAbstractItemView {{
    background-color: {COLORS['bg_card']};
    border: 1px solid {COLORS['border']};
    selection-background-color: {COLORS['bg_input']};
}}

/* ── CheckBox ── */
QCheckBox {{
    spacing: 8px;
    color: {COLORS['text_muted']};
}}
QCheckBox::indicator {{
    width: 16px; height: 16px;
    border: 1px solid {COLORS['border']};
    border-radius: 4px;
    background: {COLORS['bg_input']};
}}
QCheckBox::indicator:checked {{
    background: {COLORS['neon_blue']};
    border-color: {COLORS['neon_blue']};
}}

/* ── Botões ── */
QPushButton#btn_add {{
    background-color: {COLORS['neon_blue']};
    color: {COLORS['bg_dark']};
    border: none;
    border-radius: 6px;
    padding: 8px;
    font-weight: bold;
}}
QPushButton#btn_add:hover  {{ background-color: #79c0ff; }}
QPushButton#btn_add:pressed {{ background-color: #388bfd; }}

QPushButton#btn_clear {{
    background-color: transparent;
    color: {COLORS['text_muted']};
    border: 1px solid {COLORS['border']};
    border-radius: 6px;
    padding: 8px;
}}
QPushButton#btn_clear:hover {{ border-color: {COLORS['neon_red']}; color: {COLORS['neon_red']}; }}

/* ── Tabela ── */
QTableWidget {{
    background-color: {COLORS['bg_card']};
    border: 1px solid {COLORS['border']};
    border-radius: 8px;
    gridline-color: {COLORS['border']};
    outline: none;
}}
QTableWidget::item {{
    padding: 6px 10px;
    border: none;
}}
QTableWidget::item:selected {{
    background-color: {COLORS['bg_input']};
    color: {COLORS['text']};
}}
QHeaderView::section {{
    background-color: {COLORS['bg_input']};
    color: {COLORS['text_muted']};
    border: none;
    border-bottom: 1px solid {COLORS['border']};
    padding: 6px 10px;
    font-weight: bold;
    font-size: 11px;
    text-transform: uppercase;
}}

/* ── ScrollBar ── */
QScrollBar:vertical {{
    background: {COLORS['bg_dark']};
    width: 8px;
    border-radius: 4px;
}}
QScrollBar::handle:vertical {{
    background: {COLORS['border']};
    border-radius: 4px;
    min-height: 20px;
}}
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{ height: 0; }}

/* ── Labels de título ── */
QLabel#title {{
    font-size: 20px;
    font-weight: bold;
    color: {COLORS['neon_blue']};
}}
QLabel#subtitle {{
    font-size: 11px;
    color: {COLORS['text_muted']};
}}
QLabel#section_title {{
    font-size: 11px;
    font-weight: bold;
    color: {COLORS['text_muted']};
    text-transform: uppercase;
    letter-spacing: 1px;
}}
"""
