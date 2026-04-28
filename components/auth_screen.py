"""
components/auth_screen.py
Tela de login / cadastro do FluxCash.
"""
from __future__ import annotations

import streamlit as st

from services.auth import sign_in, sign_up
from styles import BG_CARD, BG_DARK, EXPENSE, INCOME, NEUTRAL, PRIMARY, TEXT


def _inject_styles() -> None:
    st.markdown(
        f"""
        <style>
        /* Centraliza o card na tela */
        .auth-wrapper {{
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 70vh;
        }}
        .auth-card {{
            background: {BG_CARD};
            border: 1px solid #30363d;
            border-radius: 14px;
            padding: 40px 36px;
            max-width: 420px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }}
        .auth-logo {{
            font-size: 2.4rem;
            text-align: center;
            margin-bottom: 4px;
        }}
        .auth-title {{
            color: {TEXT};
            font-size: 1.5rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 2px;
        }}
        .auth-subtitle {{
            color: {NEUTRAL};
            font-size: 0.85rem;
            text-align: center;
            margin-bottom: 24px;
        }}
        /* Botão primário */
        div[data-testid="stForm"] button[kind="primaryFormSubmit"],
        div[data-testid="stForm"] button[kind="primary"] {{
            background: {PRIMARY} !important;
            color: {BG_DARK} !important;
            font-weight: 700 !important;
            border-radius: 8px !important;
            width: 100%;
        }}
        </style>
        """,
        unsafe_allow_html=True,
    )


def render_auth_screen() -> bool:
    """
    Renderiza a tela de autenticação.
    Retorna True quando o usuário estiver autenticado.
    """
    _inject_styles()

    # Logo + título
    st.markdown(
        f"""
        <div class="auth-logo">💸</div>
        <div class="auth-title">FluxCash</div>
        <div class="auth-subtitle">Seu gestor financeiro pessoal</div>
        """,
        unsafe_allow_html=True,
    )

    # Seletor: já tem conta ou não
    col_l, col_c, col_r = st.columns([1, 2, 1])
    with col_c:
        mode = st.radio(
            "Você já tem uma conta?",
            options=["✅  Sim, tenho conta", "🆕  Não, quero me cadastrar"],
            horizontal=False,
            label_visibility="visible",
        )

    st.divider()

    has_account = mode.startswith("✅")

    col_l, col_c, col_r = st.columns([1, 2, 1])
    with col_c:
        if has_account:
            _render_login_form()
        else:
            _render_register_form()

    return False  # ainda não autenticado (rerun cuida disso)


def _render_login_form() -> None:
    st.subheader("Entrar na conta")
    with st.form("login_form", clear_on_submit=False):
        email = st.text_input("E-mail", placeholder="seu@email.com")
        password = st.text_input("Senha", type="password", placeholder="••••••••")
        submitted = st.form_submit_button("Entrar", use_container_width=True, type="primary")

    if submitted:
        if not email or not password:
            st.warning("Preencha e-mail e senha.")
            return
        with st.spinner("Autenticando..."):
            if sign_in(email, password):
                st.success("✅ Login realizado com sucesso!")
                st.rerun()


def _render_register_form() -> None:
    # Se já cadastrou e está aguardando confirmação, mostra tela de e-mail
    if st.session_state.get("awaiting_confirmation"):
        _render_confirm_email_screen()
        return

    st.subheader("Criar conta")
    with st.form("register_form", clear_on_submit=False):
        email = st.text_input("E-mail", placeholder="seu@email.com")
        password = st.text_input("Senha", type="password", placeholder="Mínimo 6 caracteres")
        confirm = st.text_input("Confirmar senha", type="password", placeholder="Repita a senha")
        submitted = st.form_submit_button("Criar conta", use_container_width=True, type="primary")

    if submitted:
        if not email or not password or not confirm:
            st.warning("Preencha todos os campos.")
            return
        if len(password) < 6:
            st.warning("A senha deve ter pelo menos 6 caracteres.")
            return
        if password != confirm:
            st.error("❌ As senhas não coincidem.")
            return
        with st.spinner("Criando conta..."):
            success, needs_confirm = sign_up(email, password)
            if success:
                if needs_confirm:
                    st.session_state["awaiting_confirmation"] = email
                    st.rerun()
                else:
                    st.success("✅ Conta criada! Bem-vindo ao FluxCash.")
                    st.rerun()


def _render_confirm_email_screen() -> None:
    email = st.session_state.get("awaiting_confirmation", "")
    st.markdown(
        f"""
        <div style="text-align:center;padding:24px 0 8px">
            <div style="font-size:3rem">📬</div>
            <div style="font-size:1.3rem;font-weight:700;color:{TEXT};margin:12px 0 6px">
                Confirme seu e-mail
            </div>
            <div style="color:{NEUTRAL};font-size:0.9rem;line-height:1.6">
                Enviamos um link de confirmação para<br>
                <strong style="color:{PRIMARY}">{email}</strong><br><br>
                Abra seu e-mail e clique no link para ativar sua conta.<br>
                Depois volte aqui e faça login.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.markdown("<br>", unsafe_allow_html=True)
    if st.button("Já confirmei, ir para o login", use_container_width=True, type="primary"):
        st.session_state.pop("awaiting_confirmation", None)
        st.rerun()
