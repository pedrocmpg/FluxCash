"""
services/supabase_client.py
Singleton do cliente Supabase com validação robusta de credenciais.

Segurança:
  - Credenciais lidas de variáveis de ambiente ou st.secrets (nunca hardcoded)
  - URL validada como HTTPS antes de criar o cliente
  - Chave validada como JWT não-vazia
  - Mensagens de erro não expõem os valores das credenciais
"""
from __future__ import annotations

import logging
import os
import re

import streamlit as st
from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

logger = logging.getLogger("fluxcash.supabase")

# Regex básica para validar URL HTTPS do Supabase
_SUPABASE_URL_RE = re.compile(r"^https://[a-z0-9]+\.supabase\.co$", re.IGNORECASE)

# Regex básica para validar JWT (3 partes separadas por ponto)
_JWT_RE = re.compile(r"^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$")


def _validate_credentials(url: str, key: str) -> list[str]:
    """
    Valida as credenciais do Supabase.
    Retorna lista de erros (vazia = credenciais válidas).
    """
    errors: list[str] = []

    if not url:
        errors.append("SUPABASE_URL não configurada")
    elif not _SUPABASE_URL_RE.match(url):
        errors.append("SUPABASE_URL inválida (deve ser https://<projeto>.supabase.co)")

    if not key:
        errors.append("SUPABASE_KEY não configurada")
    elif not _JWT_RE.match(key):
        errors.append("SUPABASE_KEY inválida (formato JWT esperado)")

    return errors


@st.cache_resource
def get_supabase() -> Client:
    """
    Retorna singleton do cliente Supabase.

    Ordem de leitura das credenciais:
      1. Variáveis de ambiente (SUPABASE_URL, SUPABASE_KEY)
      2. st.secrets (para deploy no Streamlit Cloud)

    Segurança:
      - Credenciais validadas antes de criar o cliente
      - Mensagens de erro não expõem os valores
      - URL deve ser HTTPS e apontar para *.supabase.co
    """
    url = os.environ.get("SUPABASE_URL", "") or st.secrets.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_KEY", "") or st.secrets.get("SUPABASE_KEY", "")

    errors = _validate_credentials(url, key)
    if errors:
        error_msg = " | ".join(errors)
        logger.error("supabase.get_supabase: credenciais inválidas — %s", error_msg)
        st.error(
            f"🔴 Configuração do Supabase inválida: {error_msg}. "
            "Configure as variáveis de ambiente ou `.streamlit/secrets.toml`."
        )
        st.stop()

    logger.info("supabase.get_supabase: cliente criado para %s", url)
    return create_client(url, key)
