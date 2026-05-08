"""
Página de transações: tabela filtrável + formulário de entrada.
"""
from __future__ import annotations

import html
from datetime import date

import streamlit as st

from components.form import render_form
from components.transaction_form import render_transaction_form
from services.supabase_client import get_supabase
from services.transaction_service import TransactionService
from styles import GLOBAL_CSS, BG_CARD, BORDER, EXPENSE, INCOME, NEUTRAL, TEXT

st.markdown(GLOBAL_CSS, unsafe_allow_html=True)


def _validate_uuid(value: str) -> bool:
    """Valida formato UUID básico para evitar inputs maliciosos."""
    import re
    return bool(re.match(
        r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        value.strip().lower(),
    ))


def main() -> None:
    st.title("💳 Transações")

    service = TransactionService(get_supabase())

    # --- Filtros ---
    with st.expander("🔍 Filtros", expanded=False):
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
            start_date=start or None,   # type: ignore[arg-type]
            end_date=end or None,       # type: ignore[arg-type]
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
                "Tipo": st.column_config.TextColumn(width="small"),
            },
        )

        # Resumo rápido
        total_income  = sum(t.value for t in transactions if t.type == "receita")
        total_expense = sum(t.value for t in transactions if t.type == "despesa")
        balance       = total_income - total_expense

        c1, c2, c3 = st.columns(3)
        c1.metric("Receitas", f"R$ {total_income:,.2f}")
        c2.metric("Despesas", f"R$ {total_expense:,.2f}")
        c3.metric("Saldo", f"R$ {balance:,.2f}", delta=f"{balance:+,.2f}")

        # --- Exclusão com validação de UUID ---
        with st.expander("🗑️ Excluir transação"):
            st.caption("Cole o ID da transação que deseja remover. Esta ação é irreversível.")
            tx_id = st.text_input(
                "ID da transação",
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                key="delete_tx_id",
            )

            col_btn, col_warn = st.columns([1, 3])
            with col_btn:
                confirm_delete = st.checkbox("Confirmar exclusão", key="confirm_delete")
            with col_warn:
                if confirm_delete:
                    st.warning("⚠️ A transação será removida permanentemente.")

            if st.button("Excluir", type="primary", disabled=not confirm_delete):
                tid = tx_id.strip()
                if not tid:
                    st.warning("Informe o ID da transação.")
                elif not _validate_uuid(tid):
                    st.error("❌ ID inválido. Use o formato UUID exibido na tabela.")
                else:
                    try:
                        service.delete_transaction(tid)
                        st.success("✅ Transação excluída.")
                        st.rerun()
                    except Exception:
                        st.error("🔴 Erro ao excluir. Tente novamente.")
    else:
        st.markdown(
            f"""
            <div style="
                text-align:center;
                padding:48px 20px;
                background:{BG_CARD};
                border:1px dashed {BORDER};
                border-radius:12px;
                margin:16px 0;
            ">
                <div style="font-size:2.5rem;margin-bottom:10px">📋</div>
                <p style="color:{TEXT};font-size:1rem;font-weight:600;margin:0 0 4px">
                    Nenhuma transação encontrada
                </p>
                <p style="color:{NEUTRAL};font-size:0.875rem;margin:0">
                    Ajuste os filtros ou adicione uma nova transação abaixo.
                </p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.divider()

    # --- Formulário de nova transação ---
    render_form(service)


main()
