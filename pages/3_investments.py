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
from styles import INVESTMENT, INCOME, NEUTRAL


def main() -> None:
    st.title("📈 Investimentos")

    service = TransactionService(get_supabase())

    with st.spinner("Carregando investimentos..."):
        all_transactions = service.fetch_transactions()

    investments = [t for t in all_transactions if t.investment_type in ("Individual", "Conjunto")]

    if not investments:
        st.info("Nenhum investimento registrado ainda.")
        return

    # --- KPIs ---
    total = sum(t.value for t in investments)
    individual = sum(t.value for t in investments if t.investment_type == "Individual")
    conjunto = sum(t.value for t in investments if t.investment_type == "Conjunto")

    col1, col2, col3 = st.columns(3)
    with col1:
        kpi_card("Total Investido", total, INVESTMENT)
    with col2:
        kpi_card("Individual", individual, INCOME)
    with col3:
        kpi_card("Conjunto", conjunto, NEUTRAL)

    st.divider()

    # --- Timeline ---
    st.subheader("Timeline de Aportes")
    st.plotly_chart(investment_timeline(investments), use_container_width=True)

    # --- Breakdown ---
    st.subheader("Breakdown por Tipo")
    col_a, col_b = st.columns(2)

    df = pd.DataFrame([t.model_dump() for t in investments])

    with col_a:
        by_type = df.groupby("investment_type")["value"].sum().reset_index()
        fig = go.Figure(go.Pie(
            labels=by_type["investment_type"],
            values=by_type["value"],
            hole=0.5,
            marker_colors=[INCOME, NEUTRAL],
        ))
        fig.update_layout(
            paper_bgcolor="#0d1117",
            plot_bgcolor="#161b22",
            font=dict(color="#e6edf3"),
            margin=dict(l=16, r=16, t=36, b=16),
            title="Individual vs Conjunto",
        )
        st.plotly_chart(fig, use_container_width=True)

    with col_b:
        by_cat = df.groupby("category")["value"].sum().reset_index().sort_values("value", ascending=False)
        fig2 = go.Figure(go.Bar(
            x=by_cat["value"],
            y=by_cat["category"],
            orientation="h",
            marker_color=INVESTMENT,
        ))
        fig2.update_layout(
            paper_bgcolor="#0d1117",
            plot_bgcolor="#161b22",
            font=dict(color="#e6edf3"),
            margin=dict(l=16, r=16, t=36, b=16),
            title="Por Categoria",
        )
        st.plotly_chart(fig2, use_container_width=True)


main()
