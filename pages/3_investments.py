"""
Página de investimentos: timeline + breakdown Individual/Conjunto.
"""
from __future__ import annotations

import streamlit as st
import plotly.graph_objects as go
import pandas as pd

from components.charts import investment_timeline
from components.kpi_cards import kpi_card
from services.supabase_client import get_supabase
from services.transaction_service import TransactionService
from styles import (
    GLOBAL_CSS, BG_CARD, BG_DARK, BORDER, INCOME, INVESTMENT,
    NEUTRAL, RADIUS_MD, TEXT,
    GRADIENT_INCOME, GRADIENT_INVESTMENT,
)

st.markdown(GLOBAL_CSS, unsafe_allow_html=True)


def main() -> None:
    st.title("📈 Investimentos")

    service = TransactionService(get_supabase())

    with st.spinner("Carregando investimentos..."):
        all_transactions = service.fetch_transactions()

    investments = [t for t in all_transactions if t.investment_type in ("Individual", "Conjunto")]

    if not investments:
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
                <div style="font-size:3rem;margin-bottom:12px">📊</div>
                <p style="color:{TEXT};font-size:1.1rem;font-weight:600;margin:0 0 6px">
                    Nenhum investimento registrado
                </p>
                <p style="color:{NEUTRAL};font-size:0.875rem;margin:0">
                    Adicione transações com tipo de investimento Individual ou Conjunto.
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )
        return

    # --- KPIs ---
    total      = sum(t.value for t in investments)
    individual = sum(t.value for t in investments if t.investment_type == "Individual")
    conjunto   = sum(t.value for t in investments if t.investment_type == "Conjunto")

    col1, col2, col3 = st.columns(3)
    with col1:
        kpi_card("Total Investido", total, INVESTMENT, icon="💼", gradient=GRADIENT_INVESTMENT)
    with col2:
        kpi_card("Individual", individual, INCOME, icon="👤", gradient=GRADIENT_INCOME)
    with col3:
        pct_conjunto = (conjunto / total * 100) if total > 0 else 0
        kpi_card("Conjunto", conjunto, NEUTRAL, icon="🤝")

    st.divider()

    # --- Timeline ---
    st.subheader("Timeline de Aportes")
    st.plotly_chart(investment_timeline(investments), use_container_width=True)

    # --- Breakdown ---
    st.subheader("Breakdown por Tipo")
    col_a, col_b = st.columns(2)

    df = pd.DataFrame([t.model_dump() for t in investments])

    _layout = dict(
        paper_bgcolor=BG_DARK,
        plot_bgcolor=BG_CARD,
        font=dict(color=TEXT, size=13),
        margin=dict(l=16, r=16, t=40, b=16),
        legend=dict(bgcolor="rgba(0,0,0,0)"),
    )

    with col_a:
        by_type = df.groupby("investment_type")["value"].sum().reset_index()
        fig = go.Figure(go.Pie(
            labels=by_type["investment_type"],
            values=by_type["value"],
            hole=0.55,
            marker_colors=[INCOME, NEUTRAL],
            hovertemplate="%{label}: R$ %{value:,.2f} (%{percent})<extra></extra>",
        ))
        fig.update_layout(**_layout, title="Individual vs Conjunto")
        st.plotly_chart(fig, use_container_width=True)

    with col_b:
        by_cat = (
            df.groupby("category")["value"]
            .sum()
            .reset_index()
            .sort_values("value", ascending=True)
        )
        fig2 = go.Figure(go.Bar(
            x=by_cat["value"],
            y=by_cat["category"],
            orientation="h",
            marker_color=INVESTMENT,
            hovertemplate="R$ %{x:,.2f}<extra>%{y}</extra>",
        ))
        fig2.update_layout(**_layout, title="Por Categoria")
        st.plotly_chart(fig2, use_container_width=True)


main()
