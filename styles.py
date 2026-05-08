# ---------------------------------------------------------------------------
# FluxCash — Design System
# Paleta dark/neon com tokens semânticos e utilitários CSS
# ---------------------------------------------------------------------------

# --- Cores base ---
PRIMARY    = "#4ade80"   # Mint    — ações primárias, destaques positivos
INCOME     = "#22c55e"   # Verde   — receitas
EXPENSE    = "#f87171"   # Coral   — despesas
INVESTMENT = "#fbbf24"   # Âmbar   — investimentos
NEUTRAL    = "#8b949e"   # Muted   — textos secundários
BG_DARK    = "#0d1117"   # Base    — fundo principal
BG_CARD    = "#161b22"   # Card    — fundo de cards
BG_HOVER   = "#1c2128"   # Hover   — estado hover de cards
TEXT       = "#e6edf3"   # Light   — texto principal
BORDER     = "#30363d"   # Border  — bordas sutis
SUCCESS    = "#4ade80"   # Alias de PRIMARY
WARNING    = "#fbbf24"   # Alias de INVESTMENT
DANGER     = "#f87171"   # Alias de EXPENSE
INFO       = "#60a5fa"   # Azul    — informações neutras

# --- Gradientes ---
GRADIENT_INCOME     = "linear-gradient(135deg, #22c55e22, #22c55e08)"
GRADIENT_EXPENSE    = "linear-gradient(135deg, #f8717122, #f8717108)"
GRADIENT_INVESTMENT = "linear-gradient(135deg, #fbbf2422, #fbbf2408)"
GRADIENT_BALANCE    = "linear-gradient(135deg, #4ade8022, #4ade8008)"

# --- Sombras ---
SHADOW_SM  = "0 2px 8px rgba(0,0,0,0.3)"
SHADOW_MD  = "0 4px 16px rgba(0,0,0,0.4)"
SHADOW_LG  = "0 8px 32px rgba(0,0,0,0.5)"

# --- Raios de borda ---
RADIUS_SM  = "6px"
RADIUS_MD  = "10px"
RADIUS_LG  = "14px"
RADIUS_XL  = "20px"

# ---------------------------------------------------------------------------
# CSS global injetado via st.markdown — aplica o design system ao Streamlit
# ---------------------------------------------------------------------------
GLOBAL_CSS = f"""
<style>
/* ── Reset & Base ─────────────────────────────────────────────────────── */
html, body, [data-testid="stAppViewContainer"] {{
    background-color: {BG_DARK} !important;
    color: {TEXT};
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
}}

/* ── Sidebar ──────────────────────────────────────────────────────────── */
[data-testid="stSidebar"] {{
    background-color: {BG_CARD} !important;
    border-right: 1px solid {BORDER};
}}
[data-testid="stSidebar"] .stMarkdown p {{
    color: {NEUTRAL};
    font-size: 13px;
}}

/* ── Cabeçalhos ───────────────────────────────────────────────────────── */
h1 {{ color: {TEXT}; font-weight: 700; letter-spacing: -0.5px; }}
h2 {{ color: {TEXT}; font-weight: 600; }}
h3 {{ color: {TEXT}; font-weight: 600; }}

/* ── Inputs ───────────────────────────────────────────────────────────── */
[data-testid="stTextInput"] input,
[data-testid="stNumberInput"] input,
[data-testid="stSelectbox"] select {{
    background-color: {BG_HOVER} !important;
    border: 1px solid {BORDER} !important;
    border-radius: {RADIUS_MD} !important;
    color: {TEXT} !important;
    transition: border-color 0.2s ease;
}}
[data-testid="stTextInput"] input:focus,
[data-testid="stNumberInput"] input:focus {{
    border-color: {PRIMARY} !important;
    box-shadow: 0 0 0 2px {PRIMARY}22 !important;
}}

/* ── Botões primários ─────────────────────────────────────────────────── */
button[kind="primary"], button[kind="primaryFormSubmit"] {{
    background: {PRIMARY} !important;
    color: {BG_DARK} !important;
    font-weight: 700 !important;
    border-radius: {RADIUS_MD} !important;
    border: none !important;
    transition: opacity 0.2s ease, transform 0.1s ease !important;
}}
button[kind="primary"]:hover, button[kind="primaryFormSubmit"]:hover {{
    opacity: 0.9 !important;
    transform: translateY(-1px) !important;
}}

/* ── Botões secundários ───────────────────────────────────────────────── */
button[kind="secondary"] {{
    background: transparent !important;
    border: 1px solid {BORDER} !important;
    color: {TEXT} !important;
    border-radius: {RADIUS_MD} !important;
}}

/* ── Divider ──────────────────────────────────────────────────────────── */
hr {{
    border-color: {BORDER} !important;
    margin: 16px 0 !important;
}}

/* ── Dataframe / Tabela ───────────────────────────────────────────────── */
[data-testid="stDataFrame"] {{
    border: 1px solid {BORDER};
    border-radius: {RADIUS_MD};
    overflow: hidden;
}}

/* ── Expander ─────────────────────────────────────────────────────────── */
[data-testid="stExpander"] {{
    border: 1px solid {BORDER} !important;
    border-radius: {RADIUS_MD} !important;
    background: {BG_CARD} !important;
}}

/* ── Toast / Alert ────────────────────────────────────────────────────── */
[data-testid="stAlert"] {{
    border-radius: {RADIUS_MD} !important;
}}

/* ── Spinner ──────────────────────────────────────────────────────────── */
[data-testid="stSpinner"] > div {{
    border-top-color: {PRIMARY} !important;
}}

/* ── Scrollbar ────────────────────────────────────────────────────────── */
::-webkit-scrollbar {{ width: 6px; height: 6px; }}
::-webkit-scrollbar-track {{ background: {BG_DARK}; }}
::-webkit-scrollbar-thumb {{ background: {BORDER}; border-radius: 3px; }}
::-webkit-scrollbar-thumb:hover {{ background: {NEUTRAL}; }}
</style>
"""
