import os

import streamlit as st
from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()


@st.cache_resource
def get_supabase() -> Client:
    """
    Retorna singleton do cliente Supabase.
    Lê SUPABASE_URL e SUPABASE_KEY do .env ou variáveis de ambiente.
    """
    url = os.environ.get("SUPABASE_URL") or st.secrets.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_KEY") or st.secrets.get("SUPABASE_KEY", "")

    if not url or not key:
        st.error("Credenciais do Supabase não encontradas. Configure o arquivo .env.")
        st.stop()

    return create_client(url, key)
