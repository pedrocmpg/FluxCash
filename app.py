"""
FluxCash — Entry Point & Home Dashboard
Cards de resumo (st.metric) + 4 gráficos financeiros + filtros laterais.
"""
from __future__ import annotations

from datetime import date

import plotly.express as px
import streamlit as st

st.set_page_config(
    page_title="FluxCash · Dashboard",
    page_icon="💸",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Imports após set_page_config
from components.auth_screen import render_auth_screen        # noqa: E402
from services.auth import get_current_user, sign_out         # noqa: E402
from services.database import get_summary, get_transactions  # noqa: E402
from services.supabase_client import get_supabase            # noqa: E402
from styles import GLOBAL_CSS, BG_CARD, BG_DARK, BORDER, EXPENSE, INCOME, INVESTMENT, NEUTRAL, PRIMARY, TEXT  # noqa: E402

# ---------------------------------------------------------------------------
# CSS global
# ---------------------------------------------------------------------------
st.markdown(GLOBAL_CSS, unsafe_allow_html=True)

# ---------------------------------------------------------------------------
# Verificação de conexão
# ---------------------------------------------------------------------------
try:
    get_supabase()
except Exception:
    st.error(
        "🔴 Não foi possível conectar ao banco de dados. "
        "Verifique `.streamlit/secrets.toml` ou o arquivo `.env` e tente novamente."
    )
    st.stop()

# ---------------------------------------------------------------------------
# Guard de autenticação — exibe tela de login se não houver sessão
# ---------------------------------------------------------------------------
if not get_current_user():
    render_auth_screen()
    st.stop()

# ---------------------------------------------------------------------------
# Sidebar — usuário e navegação
# ---------------------------------------------------------------------------
with st.sidebar:
    user = get_current_user()

    # Avatar e e-mail
    st.markdown(
        f"""
        <div style="
            display:flex;
            align-items:center;
            gap:10px;
            padding:12px 0 16px;
            border-bottom:1px solid {BORDER};
            margin-bottom:16px;
        ">
            <div style="
                width:36px;height:36px;
                background:{PRIMARY}22;
                border:1px solid {PRIMARY}44;
                border-radius:50%;
                display:flex;align-items:center;justify-content:center;
                font-size:16px;
            ">👤</div>
            <div>
                <p style="margin:0;color:{TEXT};font-size:13px;font-weight:600">
                    {user.email.split("@")[0] if user else "Usuário"}
                </p>
                <p style="margin:0;color:{NEUTRAL};font-size:11px">
                    {user.email if user else ""}
                </p>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.header("Filtros")
    use_filter = st.checkbox("Filtrar por período", value=False)

    if use_filter:
        start_date = st.date_input("Data inicial", value=date.today().replace(day=1))
        end_date   = st.date_input("Data final",   value=date.today())
        if start_date > end_date:
            st.warning("Data inicial deve ser anterior à data final.")
            start_date = end_date = None
    else:
        start_date = end_date = None

    st.divider()

    if st.button("🚪 Sair", use_container_width=True):
        sign_out()

# ---------------------------------------------------------------------------
# Conteúdo principal
# ---------------------------------------------------------------------------
st.title("📊 Dashboard")

with st.spinner("Carregando dados..."):
    from services.supabase_client import get_supabase as _sb
    from services.transaction_service import TransactionService
    _service = TransactionService(_sb())
    summary      = _service.fetch_summary(start_date, end_date)
    transactions = _service.fetch_transactions(start_date, end_date)

# KPIs
from components.kpi_cards import render_kpi_row
render_kpi_row(summary)

st.divider()

# Gráficos
if transactions:
    from components.charts import (
        balance_trend,
        expense_donut,
        income_expense_bar,
        investment_timeline,
    )

    col1, col2 = st.columns(2)
    with col1:
        st.plotly_chart(income_expense_bar(transactions), use_container_width=True)
    with col2:
        st.plotly_chart(expense_donut(transactions), use_container_width=True)

    col3, col4 = st.columns(2)
    with col3:
        st.plotly_chart(balance_trend(transactions), use_container_width=True)
    with col4:
        st.plotly_chart(investment_timeline(transactions), use_container_width=True)
else:
    st.markdown(
        f"""
        <div style="
            text-align:center;
            padding:60px 20px;
            background:{BG_CARD};
            border:1px dashed {BORDER};
            border-radius:12px;
            margin-top:16px;
        ">
            <div style="font-size:3rem;margin-bottom:12px">📭</div>
            <p style="color:{TEXT};font-size:1.1rem;font-weight:600;margin:0 0 6px">
                Nenhuma transação encontrada
            </p>
            <p style="color:{NEUTRAL};font-size:0.875rem;margin:0">
                Ajuste os filtros ou adicione transações na página <strong>Transações</strong>.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )
