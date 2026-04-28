"""
services/auth.py
Funções de autenticação usando Supabase Auth.
"""
from __future__ import annotations

import streamlit as st
from supabase import AuthApiError

from services.supabase_client import get_supabase


def sign_in(email: str, password: str) -> bool:
    """Faz login com email e senha. Retorna True em caso de sucesso."""
    try:
        client = get_supabase()
        response = client.auth.sign_in_with_password({"email": email, "password": password})
        st.session_state["user"] = response.user
        return True
    except AuthApiError as exc:
        msg = str(exc).lower()
        if "email not confirmed" in msg:
            st.error("❌ E-mail não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.")
        elif "invalid" in msg or "credentials" in msg:
            st.error("❌ E-mail ou senha incorretos.")
        else:
            st.error(f"❌ Erro ao entrar: {exc}")
        return False
    except Exception:
        st.error("🔴 Erro ao conectar. Tente novamente.")
        return False


def sign_up(email: str, password: str) -> tuple[bool, bool]:
    """
    Cria uma nova conta.
    Retorna (sucesso, precisa_confirmar_email).
    """
    try:
        client = get_supabase()
        response = client.auth.sign_up({"email": email, "password": password})
        if response.user:
            # Se já veio sessão ativa (confirmação desativada no Supabase)
            if response.session:
                st.session_state["user"] = response.user
                return True, False
            # Cadastro criado mas aguardando confirmação de e-mail
            return True, True
        return False, False
    except AuthApiError as exc:
        msg = str(exc).lower()
        if "already registered" in msg or "already exists" in msg:
            st.error("❌ Este e-mail já está cadastrado. Faça login.")
        else:
            st.error(f"❌ Erro ao criar conta: {exc}")
        return False, False
    except Exception:
        st.error("🔴 Erro ao conectar. Tente novamente.")
        return False, False


def sign_out() -> None:
    """Encerra a sessão do usuário."""
    try:
        get_supabase().auth.sign_out()
    except Exception:
        pass
    st.session_state.pop("user", None)
    st.rerun()


def get_current_user():
    """Retorna o usuário logado ou None."""
    return st.session_state.get("user")
