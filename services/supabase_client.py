import os

import streamlit as st
from supabase import Client, create_client


@st.cache_resource
def get_supabase() -> Client:
    """
    Retorna singleton do cliente Supabase.
    Lê SUPABASE_URL e SUPABASE_KEY de st.secrets ou variáveis de ambiente.

    Precondições:
      - SUPABASE_URL e SUPABASE_KEY definidos em .streamlit/secrets.toml
        ou como variáveis de ambiente.
    Pós-condições:
      - Retorna Client autenticado e reutilizável entre reruns.
    """
    try:
        url: str = st.secrets["SUPABASE_URL"]
        key: str = st.secrets["SUPABASE_KEY"]
    except (KeyError, FileNotFoundError):
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_KEY"]

    return create_client(url, key)
