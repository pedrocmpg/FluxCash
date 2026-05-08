"""
components/form.py
Formulário de entrada de transação com:
  - Detecção em tempo real da tag #conjunto → badge visual
  - Preview de categoria sugerida enquanto o usuário digita
  - Sanitização de inputs antes de persistir
  - Validação de categoria contra whitelist
  - Layout renovado com seções visuais claras
"""
from __future__ import annotations

import html
import re

import streamlit as st

from models.schemas import TransactionCreate
from services.transaction_service import TransactionService, suggest_category
from services.transaction_service import _CONJUNTO_RE  # regex reutilizado
from styles import (
    BG_CARD, BORDER, EXPENSE, INCOME, INVESTMENT, NEUTRAL,
    PRIMARY, RADIUS_MD, TEXT, WARNING,
)

# ---------------------------------------------------------------------------
# Whitelist de categorias válidas
# ---------------------------------------------------------------------------
_VALID_CATEGORIES: list[str] = [
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

_VALID_TYPES = {"receita", "despesa"}
_VALID_INVESTMENT_TYPES = {"N/A", "Individual", "Conjunto"}

# Regex para detectar caracteres potencialmente perigosos em HTML
_UNSAFE_CHARS_RE = re.compile(r"[<>\"'&]")


# ---------------------------------------------------------------------------
# Sanitização
# ---------------------------------------------------------------------------

def _sanitize_text(text: str) -> str:
    """
    Sanitiza texto livre para exibição segura em HTML.
    Escapa caracteres HTML especiais e limita o comprimento.
    """
    return html.escape(text.strip())[:200]


# ---------------------------------------------------------------------------
# Badge helpers
# ---------------------------------------------------------------------------

def _badge(label: str, color: str) -> str:
    """Retorna HTML de um badge colorido."""
    return (
        f'<span style="'
        f"background:{color}18;"
        f"border:1px solid {color}44;"
        f"color:{color};"
        f"border-radius:999px;"
        f"padding:3px 10px;"
        f"font-size:12px;"
        f"font-weight:600;"
        f'margin-right:6px;display:inline-block">{html.escape(label)}</span>'
    )


def _render_live_badges(description: str, category: str) -> None:
    """
    Exibe badges em tempo real abaixo do campo de descrição:
      - 🤝 Conjunto  → quando #conjunto detectado na descrição
      - Categoria sugerida → quando category == 'Outros' e há sugestão
    """
    badges: list[str] = []

    if _CONJUNTO_RE.search(description):
        badges.append(_badge("🤝 Conjunto", INVESTMENT))

    if category == "Outros" and description.strip():
        suggested = suggest_category(description)
        if suggested != "Outros":
            badges.append(_badge(f"💡 {suggested}", PRIMARY))

    if badges:
        st.markdown(
            f'<div style="margin: -8px 0 12px">{" ".join(badges)}</div>',
            unsafe_allow_html=True,
        )


# ---------------------------------------------------------------------------
# Formulário principal
# ---------------------------------------------------------------------------

def render_form(service: TransactionService) -> None:
    """
    Renderiza o formulário de nova transação com feedback visual imediato.

    Segurança:
      - Inputs sanitizados antes de persistir
      - Categoria e tipo validados contra whitelist
      - Valor validado como positivo
    """
    st.markdown(
        f"""
        <div style="
            background:{BG_CARD};
            border:1px solid {BORDER};
            border-radius:{RADIUS_MD};
            padding:24px;
            margin-top:8px;
        ">
            <p style="
                margin:0 0 16px;
                color:{TEXT};
                font-size:1rem;
                font-weight:600;
            ">➕ Nova Transação</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # --- Campos reativos (fora do form para atualizar badges ao digitar) ---
    description = st.text_input(
        "Descrição",
        max_chars=200,
        placeholder='Ex: Mercado semanal  |  Use #conjunto para despesas compartilhadas',
        key="form_description",
        help="Descreva a transação. Use #conjunto para marcar despesas compartilhadas.",
    )

    category = st.selectbox(
        "Categoria",
        _VALID_CATEGORIES,
        key="form_category",
        help="Selecione 'Outros' para sugestão automática baseada na descrição.",
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
                max_value=10_000_000.0,
                step=0.01,
                format="%.2f",
                key="form_value",
                help="Valor positivo da transação.",
            )
            transaction_type = st.selectbox(
                "Tipo",
                list(_VALID_TYPES),
                format_func=lambda x: "💚 Receita" if x == "receita" else "🔴 Despesa",
                key="form_type",
            )

        with col2:
            investment_type = st.selectbox(
                "Tipo de Investimento",
                list(_VALID_INVESTMENT_TYPES),
                key="form_investment",
                help="'Conjunto' para investimentos compartilhados. Detectado automaticamente via #conjunto.",
            )

        submitted = st.form_submit_button(
            "Adicionar Transação",
            use_container_width=True,
            type="primary",
        )

    # --- Validação e persistência ---
    if submitted:
        raw_desc = st.session_state.get("form_description", "")
        raw_cat  = st.session_state.get("form_category", "Outros")

        # Sanitiza inputs
        desc = _sanitize_text(raw_desc)
        cat  = raw_cat if raw_cat in _VALID_CATEGORIES else "Outros"

        # Valida tipo contra whitelist
        tx_type = transaction_type if transaction_type in _VALID_TYPES else None
        inv_type = investment_type if investment_type in _VALID_INVESTMENT_TYPES else "N/A"

        # Validações de negócio
        if not desc:
            st.warning("⚠️ A descrição não pode estar vazia.")
            return

        if value <= 0:
            st.warning("⚠️ O valor deve ser maior que zero.")
            return

        if tx_type is None:
            st.error("❌ Tipo de transação inválido.")
            return

        payload = TransactionCreate(
            value=value,
            description=desc,
            category=cat,
            type=tx_type,        # type: ignore[arg-type]
            investment_type=inv_type,  # type: ignore[arg-type]
        )

        try:
            record = service.create_transaction(payload)
            scope_label = "🤝 Conjunto" if record.investment_type == "Conjunto" else "👤 Individual"
            st.success(
                f"✅ Transação adicionada! "
                f"Categoria: **{record.category}** · {scope_label}"
            )
            st.rerun()
        except ValueError as exc:
            st.warning(str(exc))
        except Exception:
            st.error("🔴 Erro ao salvar transação. Tente novamente.")
