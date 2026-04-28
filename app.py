"""
FluxCash — Entry Point & Home Dashboard
Cards de resumo (st.metric) + Donut chart (px.pie) + filtros laterais.
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
from styles import (                                          # noqa: E402
    BG_CARD, BG_DARK, EXPENSE, INCOME, INVESTMENT, NEUTRAL, PRIMARY, TEXT,
)

# ---------------------------------------------------------------------------
# Verificação de conexão
# ---------------------------------------------------------------------------
try:
    get_supabase()
except Exception:
    st.error(
        "🔴 Não foi possível conectar ao banco de dados. "
        "Verifique `.streamlit/secrets.toml` e tente novamente."
    )
    st.stop()

# ---------------------------------------------------------------------------
# Guard de autenticação — exibe tela de login se não houver sessão
# ---------------------------------------------------------------------------
if not get_current_user():
    render_auth_screen()
    st.stop()

# Botão de logout na sidebar
with st.sidebar:
    user = get_current_user()
    st.caption(f"👤 {user.email}")
    if st.button("Sair", use_container_width=True):
        sign_out()

# ---------------------------------------------------------------------------
# Sidebar — identidade + filtros
# ---------------------------------------------------------------------------
st.sidebar.title("💸 FluxCash")
st.sidebar.caption("Dashboard Financeiro")
st.sidebar.divider()


st.sidebar.header("Filtros")

# Filtro de escopo (Individual / Conjunto / Todas)
scope_filter: str = st.sidebar.selectbox(
    "Escopo",
    options=["Todas", "Individual", "Conjunto"],
    index=0,
    key="scope_filter",
)

# Filtro de período
use_period = st.sidebar.checkbox("Filtrar por período", value=False)
start_date: date | None = None
end_date: date | None = None

if use_period:
    start_date = st.sidebar.date_input(  # type: ignore[assignment]
        "De", value=date.today().replace(day=1)
    )
    end_date = st.sidebar.date_input(    # type: ignore[assignment]
        "Até", value=date.today()
    )
    if start_date and end_date and start_date > end_date:
        st.sidebar.warning("Data inicial deve ser anterior à data final.")
        start_date = end_date = None

st.sidebar.divider()
st.sidebar.caption("Use o menu acima para navegar entre páginas.")

# ---------------------------------------------------------------------------
# Dados — filtrados pelo escopo e período selecionados
# ---------------------------------------------------------------------------
inv_filter = None if scope_filter == "Todas" else scope_filter

with st.spinner("Carregando dados..."):
    summary = get_summary(
        start_date=start_date,
        end_date=end_date,
        investment_type=inv_filter,
    )
    transactions = get_transactions(
        start_date=start_date,
        end_date=end_date,
        investment_type=inv_filter,
    )

# ---------------------------------------------------------------------------
# Cabeçalho
# ---------------------------------------------------------------------------
st.title("📊 FluxCash · Visão Geral")

period_label = (
    f"{start_date.strftime('%d/%m/%Y')} → {end_date.strftime('%d/%m/%Y')}"
    if start_date and end_date
    else "Todo o período"
)
scope_label = f"Escopo: **{scope_filter}**"
st.caption(f"{period_label} · {scope_label}")
st.divider()

# ---------------------------------------------------------------------------
# Cards de resumo — st.metric com variação percentual
# ---------------------------------------------------------------------------

def _delta_pct(current: float, reference: float) -> str | None:
    """Calcula variação percentual em relação a uma referência."""
    if reference == 0:
        return None
    pct = ((current - reference) / abs(reference)) * 100
    return f"{pct:+.1f}%"


# Referência: total movimentado (receitas + despesas) para calcular participação
total_moved = summary.total_income + summary.total_expense

col1, col2, col3, col4 = st.columns(4)

with col1:
    balance_color = "normal" if summary.balance >= 0 else "inverse"
    st.metric(
        label="💰 Saldo",
        value=f"R$ {summary.balance:,.2f}",
        delta=_delta_pct(summary.balance, summary.total_income),
        delta_color=balance_color,
        help="Receitas − Despesas no período",
    )

with col2:
    st.metric(
        label="📈 Receitas",
        value=f"R$ {summary.total_income:,.2f}",
        delta=_delta_pct(summary.total_income, total_moved) if total_moved else None,
        delta_color="normal",
        help="Total de entradas no período",
    )

with col3:
    st.metric(
        label="📉 Despesas",
        value=f"R$ {summary.total_expense:,.2f}",
        delta=_delta_pct(summary.total_expense, total_moved) if total_moved else None,
        delta_color="inverse",
        help="Total de saídas no período",
    )

with col4:
    st.metric(
        label="🏦 Investimentos",
        value=f"R$ {summary.total_investment:,.2f}",
        delta=_delta_pct(summary.total_investment, total_moved) if total_moved else None,
        delta_color="normal",
        help="Aportes Individual + Conjunto no período",
    )

st.divider()

# ---------------------------------------------------------------------------
# Gráfico de Donut — px.pie com hole=0.4 e paleta do Design System
# ---------------------------------------------------------------------------

# Paleta de categorias mapeada para as cores do Design System
_CATEGORY_COLORS: dict[str, str] = {
    "Alimentação":  EXPENSE,
    "Transporte":   "#fb923c",   # laranja
    "Saúde":        "#38bdf8",   # azul claro
    "Educação":     PRIMARY,
    "Lazer":        INVESTMENT,
    "Moradia":      NEUTRAL,
    "Investimento": INCOME,
    "Receita":      INCOME,
    "Outros":       "#6b7280",
}

col_donut, col_info = st.columns([3, 2], gap="large")

with col_donut:
    st.subheader("Despesas por Categoria")

    expense_data = summary.expense_by_category
    if expense_data:
        labels = list(expense_data.keys())
        values = list(expense_data.values())
        colors = [_CATEGORY_COLORS.get(lbl, NEUTRAL) for lbl in labels]

        fig = px.pie(
            names=labels,
            values=values,
            hole=0.4,
            color=labels,
            color_discrete_map={lbl: _CATEGORY_COLORS.get(lbl, NEUTRAL) for lbl in labels},
        )
        fig.update_traces(
            textposition="outside",
            textinfo="percent+label",
            hovertemplate="<b>%{label}</b><br>R$ %{value:,.2f}<br>%{percent}<extra></extra>",
        )
        fig.update_layout(
            paper_bgcolor=BG_DARK,
            plot_bgcolor=BG_CARD,
            font=dict(color=TEXT, size=13),
            margin=dict(l=16, r=16, t=16, b=16),
            showlegend=True,
            legend=dict(bgcolor="rgba(0,0,0,0)", font=dict(color=TEXT)),
        )
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("Nenhuma despesa encontrada para o filtro selecionado.")

with col_info:
    st.subheader("Breakdown")

    if expense_data:
        total_exp = sum(expense_data.values())
        # Ordena por valor decrescente
        for cat, val in sorted(expense_data.items(), key=lambda x: x[1], reverse=True):
            pct = (val / total_exp * 100) if total_exp else 0
            color = _CATEGORY_COLORS.get(cat, NEUTRAL)
            st.markdown(
                f"""
                <div style="
                    display:flex;justify-content:space-between;align-items:center;
                    background:{BG_CARD};border-left:3px solid {color};
                    border-radius:6px;padding:8px 12px;margin-bottom:6px
                ">
                    <span style="color:{TEXT};font-size:13px">{cat}</span>
                    <span style="color:{color};font-weight:700;font-size:13px">
                        R$ {val:,.2f} <span style="color:{NEUTRAL};font-weight:400">({pct:.1f}%)</span>
                    </span>
                </div>
                """,
                unsafe_allow_html=True,
            )
    else:
        st.info("Sem dados para exibir.")

st.divider()

# ---------------------------------------------------------------------------
# Últimas transações (preview rápido)
# ---------------------------------------------------------------------------
st.subheader("Últimas Transações")

if transactions:
    preview = transactions[:10]
    for t in preview:
        color = INCOME if t.type == "receita" else EXPENSE
        sign = "+" if t.type == "receita" else "−"
        scope_icon = "🤝" if t.investment_type == "Conjunto" else ""
        st.markdown(
            f"""
            <div style="
                display:flex;justify-content:space-between;align-items:center;
                background:{BG_CARD};border-radius:6px;
                padding:8px 14px;margin-bottom:4px
            ">
                <div>
                    <span style="color:{TEXT};font-size:13px">{t.description[:50]}</span>
                    <span style="color:{NEUTRAL};font-size:11px;margin-left:8px">
                        {t.category} · {t.timestamp.strftime('%d/%m/%Y')} {scope_icon}
                    </span>
                </div>
                <span style="color:{color};font-weight:700;font-size:14px">
                    {sign} R$ {t.value:,.2f}
                </span>
            </div>
            """,
            unsafe_allow_html=True,
        )
else:
    st.info("Nenhuma transação encontrada. Adicione transações na página **Transações**.")
