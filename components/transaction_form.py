"""
Formulário de entrada de nova transação com validação inline.
"""
from __future__ import annotations

import streamlit as st

from models.schemas import TransactionCreate
from services.transaction_service import TransactionService


def render_transaction_form(service: TransactionService) -> TransactionCreate | None:
    """
    Renderiza o formulário de nova transação.
    Retorna TransactionCreate se submetido com sucesso, None caso contrário.
    """
    with st.form("new_transaction", clear_on_submit=True):
        st.subheader("Nova Transação")

        col1, col2 = st.columns(2)
        with col1:
            value = st.number_input("Valor (R$)", min_value=0.01, step=0.01, format="%.2f")
            transaction_type = st.selectbox("Tipo", ["receita", "despesa"])
        with col2:
            description = st.text_input("Descrição", max_chars=200)
            investment_type = st.selectbox(
                "Tipo de Investimento",
                ["N/A", "Individual", "Conjunto"],
            )

        category = st.selectbox(
            "Categoria (deixe 'Outros' para categorização automática)",
            [
                "Outros", "Alimentação", "Transporte", "Saúde",
                "Educação", "Lazer", "Moradia", "Investimento", "Receita",
            ],
        )

        submitted = st.form_submit_button("Adicionar Transação", use_container_width=True)

    if submitted:
        if not description.strip():
            st.warning("A descrição não pode estar vazia.")
            return None
        if value <= 0:
            st.warning("O valor deve ser maior que zero.")
            return None

        payload = TransactionCreate(
            value=value,
            description=description.strip(),
            category=category,
            type=transaction_type,  # type: ignore[arg-type]
            investment_type=investment_type,  # type: ignore[arg-type]
        )
        try:
            service.create_transaction(payload)
            st.success("Transação adicionada com sucesso!")
            st.rerun()
        except Exception as exc:
            st.error(f"Erro ao salvar transação: {exc}")

    return None
