"""
services/auth.py
Funções de autenticação usando Supabase Auth.

Segurança implementada:
  - Rate limiting por IP/sessão (máx. 5 tentativas em 15 min)
  - Validação de força de senha no cadastro
  - Mensagens de erro genéricas para evitar user enumeration
  - Logging estruturado de eventos de autenticação
"""
from __future__ import annotations

import logging
import re
import time
from datetime import datetime, timezone

import streamlit as st
from supabase import AuthApiError

from services.supabase_client import get_supabase

# ---------------------------------------------------------------------------
# Logger estruturado (não expõe dados sensíveis)
# ---------------------------------------------------------------------------
logger = logging.getLogger("fluxcash.auth")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

# ---------------------------------------------------------------------------
# Rate limiting em memória (por sessão Streamlit)
# ---------------------------------------------------------------------------
_MAX_ATTEMPTS = 5
_LOCKOUT_SECONDS = 15 * 60  # 15 minutos


def _get_rate_limit_key() -> str:
    return "auth_rate_limit"


def _check_rate_limit() -> tuple[bool, int]:
    """
    Verifica se o usuário está bloqueado por excesso de tentativas.
    Retorna (permitido, segundos_restantes).
    """
    key = _get_rate_limit_key()
    now = time.time()
    state = st.session_state.get(key, {"attempts": 0, "locked_until": 0.0})

    if state["locked_until"] > now:
        remaining = int(state["locked_until"] - now)
        return False, remaining

    # Reseta se o lockout expirou
    if state["locked_until"] > 0 and state["locked_until"] <= now:
        st.session_state[key] = {"attempts": 0, "locked_until": 0.0}

    return True, 0


def _record_failed_attempt() -> None:
    """Registra uma tentativa falha e aplica lockout se necessário."""
    key = _get_rate_limit_key()
    now = time.time()
    state = st.session_state.get(key, {"attempts": 0, "locked_until": 0.0})

    state["attempts"] += 1
    if state["attempts"] >= _MAX_ATTEMPTS:
        state["locked_until"] = now + _LOCKOUT_SECONDS
        logger.warning(
            "auth.lockout: %d tentativas falhas — bloqueado por %ds",
            state["attempts"],
            _LOCKOUT_SECONDS,
        )

    st.session_state[key] = state


def _reset_rate_limit() -> None:
    """Reseta o contador após login bem-sucedido."""
    st.session_state.pop(_get_rate_limit_key(), None)


# ---------------------------------------------------------------------------
# Validação de senha
# ---------------------------------------------------------------------------
_PASSWORD_MIN_LEN = 8
_PASSWORD_RULES = [
    (r"[A-Z]", "pelo menos uma letra maiúscula"),
    (r"[a-z]", "pelo menos uma letra minúscula"),
    (r"\d",    "pelo menos um número"),
]


def validate_password_strength(password: str) -> list[str]:
    """
    Valida a força da senha.
    Retorna lista de erros (vazia = senha válida).
    """
    errors: list[str] = []

    if len(password) < _PASSWORD_MIN_LEN:
        errors.append(f"mínimo de {_PASSWORD_MIN_LEN} caracteres")

    for pattern, message in _PASSWORD_RULES:
        if not re.search(pattern, password):
            errors.append(message)

    return errors


# ---------------------------------------------------------------------------
# Autenticação pública
# ---------------------------------------------------------------------------

def sign_in(email: str, password: str) -> bool:
    """
    Faz login com email e senha.
    Retorna True em caso de sucesso.

    Segurança:
      - Verifica rate limit antes de tentar
      - Mensagem genérica para evitar user enumeration
      - Registra tentativas falhas para auditoria
    """
    # Verifica rate limit
    allowed, remaining = _check_rate_limit()
    if not allowed:
        mins = remaining // 60
        secs = remaining % 60
        st.error(
            f"🔒 Muitas tentativas. Aguarde {mins}m {secs}s antes de tentar novamente."
        )
        return False

    try:
        client = get_supabase()
        response = client.auth.sign_in_with_password({"email": email, "password": password})
        st.session_state["user"] = response.user
        _reset_rate_limit()
        logger.info("auth.sign_in: sucesso para %s", _mask_email(email))
        return True

    except AuthApiError as exc:
        _record_failed_attempt()
        msg = str(exc).lower()

        if "email not confirmed" in msg:
            st.error(
                "📧 E-mail não confirmado. "
                "Verifique sua caixa de entrada e clique no link de confirmação."
            )
        else:
            # Mensagem genérica — não revela se o e-mail existe ou não
            st.error("❌ E-mail ou senha incorretos.")

        logger.warning("auth.sign_in: falha para %s — %s", _mask_email(email), type(exc).__name__)
        return False

    except Exception as exc:
        _record_failed_attempt()
        st.error("🔴 Erro ao conectar. Tente novamente.")
        logger.error("auth.sign_in: erro inesperado — %s", type(exc).__name__)
        return False


def sign_up(email: str, password: str) -> tuple[bool, bool]:
    """
    Cria uma nova conta.
    Retorna (sucesso, precisa_confirmar_email).

    Segurança:
      - Valida força da senha antes de enviar ao servidor
      - Mensagem genérica para evitar user enumeration
    """
    # Valida força da senha localmente
    errors = validate_password_strength(password)
    if errors:
        st.error("❌ Senha fraca: " + ", ".join(errors) + ".")
        return False, False

    try:
        client = get_supabase()
        response = client.auth.sign_up({"email": email, "password": password})

        if response.user:
            if response.session:
                st.session_state["user"] = response.user
                logger.info("auth.sign_up: conta criada e sessão ativa para %s", _mask_email(email))
                return True, False
            logger.info("auth.sign_up: conta criada, aguardando confirmação para %s", _mask_email(email))
            return True, True

        return False, False

    except AuthApiError as exc:
        msg = str(exc).lower()
        if "already registered" in msg or "already exists" in msg:
            # Mensagem genérica — não confirma se o e-mail existe
            st.error(
                "❌ Não foi possível criar a conta. "
                "Se já tiver cadastro, tente fazer login."
            )
        else:
            st.error(f"❌ Erro ao criar conta. Tente novamente.")
        logger.warning("auth.sign_up: falha para %s — %s", _mask_email(email), type(exc).__name__)
        return False, False

    except Exception as exc:
        st.error("🔴 Erro ao conectar. Tente novamente.")
        logger.error("auth.sign_up: erro inesperado — %s", type(exc).__name__)
        return False, False


def sign_out() -> None:
    """Encerra a sessão do usuário."""
    user = st.session_state.get("user")
    try:
        get_supabase().auth.sign_out()
        if user:
            logger.info("auth.sign_out: sessão encerrada para %s", _mask_email(getattr(user, "email", "?")))
    except Exception:
        pass
    st.session_state.pop("user", None)
    _reset_rate_limit()
    st.rerun()


def get_current_user():
    """Retorna o usuário logado ou None."""
    return st.session_state.get("user")


def get_remaining_attempts() -> int:
    """Retorna quantas tentativas restam antes do lockout."""
    key = _get_rate_limit_key()
    state = st.session_state.get(key, {"attempts": 0, "locked_until": 0.0})
    used = state.get("attempts", 0)
    return max(0, _MAX_ATTEMPTS - used)


# ---------------------------------------------------------------------------
# Helpers internos
# ---------------------------------------------------------------------------

def _mask_email(email: str) -> str:
    """Mascara o e-mail para logs: jo**@example.com"""
    if "@" not in email:
        return "***"
    local, domain = email.split("@", 1)
    masked = local[:2] + "**" if len(local) > 2 else "**"
    return f"{masked}@{domain}"
