"""
components/auth_screen.py
Tela de login / cadastro do FluxCash — design renovado.

Melhorias:
  - Layout centralizado com card glassmorphism
  - Indicador de força de senha em tempo real
  - Feedback de tentativas restantes antes do lockout
  - Animação de entrada suave
  - Acessibilidade: labels explícitos, foco gerenciado
"""
from __future__ import annotations

import streamlit as st

from services.auth import (
    get_remaining_attempts,
    sign_in,
    sign_up,
    validate_password_strength,
)
from styles import (
    BG_CARD, BG_DARK, BG_HOVER, BORDER, DANGER, EXPENSE, INCOME,
    INVESTMENT, NEUTRAL, PRIMARY, RADIUS_LG, RADIUS_MD, SHADOW_LG, TEXT,
    WARNING,
)


# ---------------------------------------------------------------------------
# CSS da tela de autenticação
# ---------------------------------------------------------------------------

def _inject_auth_styles() -> None:
    st.markdown(
        f"""
        <style>
        /* ── Wrapper centralizado ─────────────────────────────────────── */
        .auth-wrapper {{
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 80vh;
            padding: 24px 16px;
        }}

        /* ── Card principal ───────────────────────────────────────────── */
        .auth-card {{
            background: {BG_CARD};
            border: 1px solid {BORDER};
            border-radius: {RADIUS_LG};
            padding: 44px 40px;
            max-width: 440px;
            width: 100%;
            box-shadow: {SHADOW_LG};
            animation: fadeInUp 0.35s ease;
        }}

        @keyframes fadeInUp {{
            from {{ opacity: 0; transform: translateY(16px); }}
            to   {{ opacity: 1; transform: translateY(0); }}
        }}

        /* ── Logo e título ────────────────────────────────────────────── */
        .auth-logo {{
            font-size: 2.8rem;
            text-align: center;
            margin-bottom: 6px;
            filter: drop-shadow(0 0 12px {PRIMARY}66);
        }}
        .auth-title {{
            color: {TEXT};
            font-size: 1.6rem;
            font-weight: 700;
            text-align: center;
            margin: 0 0 4px;
            letter-spacing: -0.3px;
        }}
        .auth-subtitle {{
            color: {NEUTRAL};
            font-size: 0.875rem;
            text-align: center;
            margin-bottom: 28px;
        }}

        /* ── Indicador de força de senha ──────────────────────────────── */
        .pw-strength-bar {{
            height: 4px;
            border-radius: 2px;
            margin: 6px 0 4px;
            transition: width 0.3s ease, background 0.3s ease;
        }}
        .pw-strength-label {{
            font-size: 11px;
            margin-bottom: 8px;
        }}

        /* ── Aviso de tentativas ──────────────────────────────────────── */
        .attempts-warning {{
            background: {INVESTMENT}18;
            border: 1px solid {INVESTMENT}44;
            border-radius: {RADIUS_MD};
            padding: 8px 12px;
            font-size: 12px;
            color: {WARNING};
            margin-bottom: 12px;
            text-align: center;
        }}

        /* ── Botão submit ─────────────────────────────────────────────── */
        div[data-testid="stForm"] button[kind="primaryFormSubmit"],
        div[data-testid="stForm"] button[kind="primary"] {{
            background: {PRIMARY} !important;
            color: {BG_DARK} !important;
            font-weight: 700 !important;
            border-radius: {RADIUS_MD} !important;
            width: 100% !important;
            padding: 10px !important;
            font-size: 15px !important;
            transition: opacity 0.2s ease, transform 0.1s ease !important;
        }}
        div[data-testid="stForm"] button[kind="primaryFormSubmit"]:hover {{
            opacity: 0.9 !important;
            transform: translateY(-1px) !important;
        }}

        /* ── Divider com texto ────────────────────────────────────────── */
        .auth-divider {{
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 20px 0;
            color: {NEUTRAL};
            font-size: 12px;
        }}
        .auth-divider::before, .auth-divider::after {{
            content: '';
            flex: 1;
            height: 1px;
            background: {BORDER};
        }}
        </style>
        """,
        unsafe_allow_html=True,
    )


# ---------------------------------------------------------------------------
# Helpers de UI
# ---------------------------------------------------------------------------

def _password_strength_indicator(password: str) -> None:
    """Exibe barra de força de senha em tempo real."""
    if not password:
        return

    errors = validate_password_strength(password)
    total_checks = 1 + len([r for r, _ in [
        (r"[A-Z]", ""), (r"[a-z]", ""), (r"\d", "")
    ]])  # comprimento + 3 regras
    passed = total_checks - len(errors)
    ratio = passed / total_checks

    if ratio <= 0.25:
        color, label = DANGER, "Muito fraca"
    elif ratio <= 0.5:
        color, label = EXPENSE, "Fraca"
    elif ratio <= 0.75:
        color, label = WARNING, "Razoável"
    else:
        color, label = INCOME, "Forte"

    width_pct = int(ratio * 100)
    st.markdown(
        f"""
        <div class="pw-strength-bar" style="width:{width_pct}%;background:{color}"></div>
        <div class="pw-strength-label" style="color:{color}">Força: {label}</div>
        """,
        unsafe_allow_html=True,
    )


def _attempts_warning() -> None:
    """Exibe aviso de tentativas restantes se estiver próximo do lockout."""
    remaining = get_remaining_attempts()
    if 0 < remaining <= 2:
        st.markdown(
            f'<div class="attempts-warning">⚠️ {remaining} tentativa(s) restante(s) antes do bloqueio temporário.</div>',
            unsafe_allow_html=True,
        )


# ---------------------------------------------------------------------------
# Tela principal
# ---------------------------------------------------------------------------

def render_auth_screen() -> None:
    """Renderiza a tela de autenticação completa."""
    _inject_auth_styles()

    # Header da página
    st.markdown(
        """
        <div class="auth-wrapper">
        <div class="auth-card">
            <div class="auth-logo">💸</div>
            <h1 class="auth-title">FluxCash</h1>
            <p class="auth-subtitle">Seu gestor financeiro pessoal</p>
        </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Tabs de login / cadastro
    tab_login, tab_signup = st.tabs(["🔑 Entrar", "✨ Criar conta"])

    # ── Tab Login ──────────────────────────────────────────────────────────
    with tab_login:
        _attempts_warning()

        with st.form("login_form", clear_on_submit=False):
            email = st.text_input(
                "E-mail",
                placeholder="seu@email.com",
                autocomplete="email",
                key="login_email",
            )
            password = st.text_input(
                "Senha",
                type="password",
                placeholder="••••••••",
                autocomplete="current-password",
                key="login_password",
            )

            submitted = st.form_submit_button(
                "Entrar",
                use_container_width=True,
                type="primary",
            )

        if submitted:
            if not email.strip() or not password:
                st.warning("Preencha e-mail e senha.")
            else:
                with st.spinner("Autenticando..."):
                    sign_in(email.strip().lower(), password)

    # ── Tab Cadastro ───────────────────────────────────────────────────────
    with tab_signup:
        # Campo de senha fora do form para feedback em tempo real
        signup_password = st.text_input(
            "Senha",
            type="password",
            placeholder="Mínimo 8 caracteres, letras e números",
            autocomplete="new-password",
            key="signup_password_live",
        )
        _password_strength_indicator(signup_password)

        with st.form("signup_form", clear_on_submit=True):
            signup_email = st.text_input(
                "E-mail",
                placeholder="seu@email.com",
                autocomplete="email",
                key="signup_email",
            )
            signup_confirm = st.text_input(
                "Confirmar senha",
                type="password",
                placeholder="Repita a senha",
                autocomplete="new-password",
                key="signup_confirm",
            )

            submitted_signup = st.form_submit_button(
                "Criar conta",
                use_container_width=True,
                type="primary",
            )

        if submitted_signup:
            pwd = st.session_state.get("signup_password_live", "")
            _handle_signup(signup_email.strip().lower(), pwd, signup_confirm)


def _handle_signup(email: str, password: str, confirm: str) -> None:
    """Valida e processa o cadastro."""
    if not email or not password or not confirm:
        st.warning("Preencha todos os campos.")
        return

    if password != confirm:
        st.error("❌ As senhas não coincidem.")
        return

    errors = validate_password_strength(password)
    if errors:
        st.error("❌ Senha fraca: " + ", ".join(errors) + ".")
        return

    with st.spinner("Criando conta..."):
        success, needs_confirm = sign_up(email, password)

    if success:
        if needs_confirm:
            st.success(
                "✅ Conta criada! Verifique seu e-mail e clique no link de confirmação para ativar."
            )
        else:
            st.success("✅ Conta criada e login realizado!")
            st.rerun()
