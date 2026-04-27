"""
components/form.py
Formulário de entrada de transação com:
  - st.number_input com precisão de 2 casas decimais
  - Detecção em tempo real da tag #conjunto → badge visual
  - Preview de categoria sugerida enquanto o usuário digita
"""
from __future__ import annotations

import streamlit as st

from models.schemas import TransactionCreate
from services.transaction_service import TransactionService, suggest_category
from services.transaction_service import _CONJUNTO_RE  # regex reutilizado
from styles import INCOME, EXPENSE, INVESTMENT, PRIMARY, NEUTRAL, BG_CARD

_CATEGORIES = [
    "Outros",
    "Alimentação",
    "Transporte",
    "Saúde",
    "Educação",
    "Lazer",
    "Moradia",
    "Investimento",
    "Receita",
]

# ---------------------------------------------------------------------------
# Badge helpers
# ---------------------------------------------------------------------------

def _badge(label: str, color: str, bg: str = BG_CARD) -> str:
    """Retorna HTML de um badge colorido."""
    return (
        f'<span style="'
        f"background:{bg};"
        f"border:1px solid {color};"
        f"color:{color};"
        f"border-radius:999px;"
        f"padding:2px 10px;"
        f"font-size:12px;"
        f"font-weight:600;"
        f'margin-right:6px">{label}</span>'
    )


def _render_live_badges(description: str, category: str) -> None:
    """
    Exibe badges em tempo real abaixo do campo de descrição:
      - 🤝 Conjunto  → quando #conjunto detectado na descrição
      - Categoria sugerida → sempre que category == 'Outros'
    """
    badges: list[str] = []

    if _CONJUNTO_RE.search(description):
        badges.append(_badge("🤝 Conjunto", INVESTMENT))

    if category == "Outros" and description.strip():
        suggested = suggest_category(description)
        if suggested != "Outros":
            badges.append(_badge(f"💡 {suggested}", PRIMARY))

    if badges:
        st.markdown(" ".join(badges), unsafe_allow_html=True)


# ---------------------------------------------------------------------------
# Formulário principal
# ---------------------------------------------------------------------------

def render_form(service: TransactionService) -> None:
    """
    Renderiza o formulário de nova transação com feedback visual imediato.

    Fluxo:
      1. Campos fora do st.form permitem reatividade (badges ao digitar).
      2. st.form agrupa os campos de submissão e evita reruns desnecessários.
    """
    st.subheader("Nova Transação")

    # --- Campos reativos (fora do form para atualizar badges ao digitar) ---
    description = st.text_input(
        "Descrição",
        max_chars=200,
        placeholder='Ex: Mercado semanal  |  Use #conjunto para despesas compartilhadas',
        key="form_description",
    )

    category = st.selectbox(
        "Categoria (deixe 'Outros' para sugestão automática)",
        _CATEGORIES,
        key="form_category",
    )

    # Badges em tempo real
    _render_live_badges(description, category)

    st.divider()

    # --- Campos dentro do form (submetidos juntos) ---
    with st.form("transaction_form", clear_on_submit=True):
        col1, col2 = st.columns(2)

        with col1:
            value = st.number_input(
                "Valor (R$)",
                min_value=0.01,
                step=0.01,
                format="%.2f",
                key="form_value",
            )
            transaction_type = st.selectbox(
                "Tipo",
                ["receita", "despesa"],
                key="form_type",
            )

        with col2:
            # investment_type é promovido automaticamente se #conjunto detectado
            # mas o usuário ainda pode sobrescrever manualmente
            investment_type = st.selectbox(
                "Tipo de Investimento",
                ["N/A", "Individual", "Conjunto"],
                key="form_investment",
            )

        submitted = st.form_submit_button(
            "➕ Adicionar Transação",
            use_container_width=True,
            type="primary",
        )

    # --- Validação e persistência ---
    if submitted:
        desc = st.session_state.get("form_description", "").strip()
        cat = st.session_state.get("form_category", "Outros")

        if not desc:
            st.warning("A descrição não pode estar vazia.")
            return

        if value <= 0:
            st.warning("O valor deve ser maior que zero.")
            return

        payload = TransactionCreate(
            value=value,
            description=desc,
            category=cat,
            type=transaction_type,       # type: ignore[arg-type]
            investment_type=investment_type,  # type: ignore[arg-type]
        )

        try:
            record = service.create_transaction(payload)
            # Feedback de sucesso com detalhes resolvidos
            scope_label = "🤝 Conjunto" if record.investment_type == "Conjunto" else "👤 Individual"
            st.success(
                f"Transação adicionada! "
                f"Categoria: **{record.category}** · {scope_label}"
            )
            st.rerun()
        except ValueError as exc:
            st.warning(str(exc))
        except Exception as exc:
            st.error(f"Erro ao salvar transação: {exc}")
