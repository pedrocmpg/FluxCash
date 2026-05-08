"""
components/kpi_cards.py
Cards de KPI com design renovado: gradiente, ícone, delta e animação.
"""
from __future__ import annotations

import streamlit as st

from models.schemas import DashboardSummary
from styles import (
    BG_CARD, BORDER, EXPENSE, INCOME, INVESTMENT, NEUTRAL, PRIMARY,
    RADIUS_MD, SHADOW_MD, TEXT,
    GRADIENT_INCOME, GRADIENT_EXPENSE, GRADIENT_INVESTMENT, GRADIENT_BALANCE,
)

# Mapa de ícones por tipo de KPI
_ICONS = {
    "income":     "💰",
    "expense":    "💸",
    "balance":    "⚖️",
    "investment": "📈",
}


def kpi_card(
    label: str,
    value: float,
    color: str,
    prefix: str = "R$",
    icon: str = "📊",
    delta: float | None = None,
    gradient: str = "",
) -> None:
    """
    Renderiza um card de KPI com:
      - Gradiente de fundo sutil
      - Borda colorida à esquerda
      - Ícone no canto superior direito
      - Delta opcional (variação percentual)
    """
    # Formata o delta
    delta_html = ""
    if delta is not None:
        sign = "+" if delta >= 0 else ""
        delta_color = INCOME if delta >= 0 else EXPENSE
        delta_arrow = "▲" if delta >= 0 else "▼"
        delta_html = f"""
        <span style="
            color:{delta_color};
            font-size:11px;
            font-weight:600;
            background:{delta_color}18;
            padding:2px 6px;
            border-radius:999px;
        ">{delta_arrow} {sign}{delta:.1f}%</span>
        """

    bg = gradient or f"linear-gradient(135deg, {color}18, {color}06)"

    st.markdown(
        f"""
        <div style="
            background: {bg};
            border: 1px solid {BORDER};
            border-left: 4px solid {color};
            border-radius: {RADIUS_MD};
            padding: 18px 20px;
            margin-bottom: 8px;
            box-shadow: {SHADOW_MD};
            position: relative;
            transition: transform 0.2s ease;
        ">
            <div style="
                position: absolute;
                top: 14px;
                right: 16px;
                font-size: 1.4rem;
                opacity: 0.7;
            ">{icon}</div>

            <p style="
                margin: 0 0 4px;
                color: {NEUTRAL};
                font-size: 12px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            ">{label}</p>

            <p style="
                margin: 0 0 6px;
                color: {color};
                font-size: 1.6rem;
                font-weight: 700;
                letter-spacing: -0.5px;
                line-height: 1.2;
            ">{prefix} {value:,.2f}</p>

            {delta_html}
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_kpi_row(summary: DashboardSummary) -> None:
    """Renderiza a linha de 4 KPIs no topo do dashboard."""
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        kpi_card(
            "Receitas",
            summary.total_income,
            INCOME,
            icon=_ICONS["income"],
            gradient=GRADIENT_INCOME,
        )
    with col2:
        kpi_card(
            "Despesas",
            summary.total_expense,
            EXPENSE,
            icon=_ICONS["expense"],
            gradient=GRADIENT_EXPENSE,
        )
    with col3:
        balance_color = PRIMARY if summary.balance >= 0 else EXPENSE
        balance_gradient = GRADIENT_BALANCE if summary.balance >= 0 else GRADIENT_EXPENSE
        kpi_card(
            "Saldo",
            summary.balance,
            balance_color,
            icon=_ICONS["balance"],
            gradient=balance_gradient,
        )
    with col4:
        kpi_card(
            "Investimentos",
            summary.total_investment,
            INVESTMENT,
            icon=_ICONS["investment"],
            gradient=GRADIENT_INVESTMENT,
        )
