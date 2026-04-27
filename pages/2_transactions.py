"""
Página de transações: tabela filtrável + formulário de entrada.
"""
from __future__ import annotations

from datetime import date

import streamlit as st

from components.transaction_form import render_transaction_form
from components.form import render_form
from services.supabase_client import get_supabase
from services.transaction_service import TransactionService
from styles import EXPENSE, INCOME


def main() -> None:
    st.title("💳 Transações")

    service = TransactionService(get_supabase())

    # --- Filtros ---
    with st.expander("Filtros", expanded=False):
        col1, col2, col3 = st.columns(3)
        with col1:
            start = st.date_input("De", value=None, key="tx_start")
        with col2:
            end = st.date_input("Até", value=None, key="tx_end")
        with col3:
            tx_type = st.selectbox("Tipo", ["Todos", "receita", "despesa"])

    type_filter = None if tx_type == "Todos" else tx_type

    with st.spinner("Carregando transações..."):
        transactions = service.fetch_transactions(
            start_date=start or None,  # type: ignore[arg-type]
            end_date=end or None,  # type: ignore[arg-type]
            transaction_type=type_filter,
        )

    # --- Tabela ---
    if transactions:
        rows = []
        for t in transactions:
            rows.append({
                "ID": str(t.id),
                "Data": t.timestamp.strftime("%d/%m/%Y %H:%M"),
                "Descrição": t.description,
                "Categoria": t.category,
                "Tipo": t.type,
                "Valor (R$)": t.value,
                "Investimento": t.investment_type,
            })

        st.dataframe(
            rows,
            use_container_width=True,
            hide_index=True,
            column_config={
                "Valor (R$)": st.column_config.NumberColumn(format="R$ %.2f"),
                "ID": st.column_config.TextColumn(width="small"),
            },
        )

        # --- Exclusão ---
        with st.expander("Excluir transação"):
            tx_id = st.text_input("ID da transação a excluir")
            if st.button("Excluir", type="primary"):
                if tx_id.strip():
                    try:
                        service.delete_transaction(tx_id.strip())
                        st.success("Transação excluída.")
                        st.rerun()
                    except Exception as exc:
                        st.error(f"Erro: {exc}")
                else:
                    st.warning("Informe o ID da transação.")
    else:
        st.info("Nenhuma transação encontrada para o período.")

    st.divider()

    # --- Formulário de nova transação (com badges reativos) ---
    render_form(service)


main()
