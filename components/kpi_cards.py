"""
Cards de KPI renderizados no topo do dashboard.
"""
from __future__ import annotations

import streamlit as st

from models.schemas import DashboardSummary
from styles import EXPENSE, INCOME, INVESTMENT, PRIMARY


def kpi_card(label: str, value: float, color: str, prefix: str = "R$") -> None:
    """Renderiza um único card de métrica com cor customizada."""
    st.markdown(
        f"""
        <div style="
            background:#161b22;
            border-left: 4px solid {color};
            border-radius:8px;
            padding:16px 20px;
            margin-bottom:8px;
        ">
            <p style="margin:0;color:#8b949e;font-size:13px">{label}</p>
            <p style="margin:4px 0 0;color:{color};font-size:24px;font-weight:700">
                {prefix} {value:,.2f}
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_kpi_row(summary: DashboardSummary) -> None:
    """Renderiza a linha de 4 KPIs no topo do dashboard."""
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        kpi_card("Receitas", summary.total_income, INCOME)
    with col2:
        kpi_card("Despesas", summary.total_expense, EXPENSE)
    with col3:
        balance_color = PRIMARY if summary.balance >= 0 else EXPENSE
        kpi_card("Saldo", summary.balance, balance_color)
    with col4:
        kpi_card("Investimentos", summary.total_investment, INVESTMENT)
