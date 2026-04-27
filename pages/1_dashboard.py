"""
Página principal: KPIs + 4 gráficos financeiros.
"""
from __future__ import annotations

from datetime import date

import streamlit as st

from components.charts import (
    balance_trend,
    expense_donut,
    income_expense_bar,
    investment_timeline,
)
from components.kpi_cards import render_kpi_row
from services.supabase_client import get_supabase
from services.transaction_service import TransactionService


def render_filters() -> tuple[date | None, date | None]:
    """Renderiza sidebar com filtros de período. Retorna (start, end)."""
    st.sidebar.header("Filtros")
    use_filter = st.sidebar.checkbox("Filtrar por período", value=False)

    if not use_filter:
        return None, None

    start = st.sidebar.date_input("Data inicial", value=date.today().replace(day=1))
    end = st.sidebar.date_input("Data final", value=date.today())

    if start > end:
        st.sidebar.warning("Data inicial deve ser anterior à data final.")
        return None, None

    return start, end  # type: ignore[return-value]


def main() -> None:
    st.title("📊 Dashboard")

    service = TransactionService(get_supabase())
    start, end = render_filters()

    with st.spinner("Carregando dados..."):
        summary = service.fetch_summary(start, end)
        transactions = service.fetch_transactions(start, end)

    if not transactions:
        st.info("Nenhuma transação encontrada para o período. Ajuste os filtros ou adicione transações.")

    render_kpi_row(summary)
    st.divider()

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


main()
