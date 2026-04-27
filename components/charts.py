"""
Funções Plotly puras — recebem dados, retornam go.Figure.
Sem efeitos colaterais; aplicam o design system dark/neon.
"""
from __future__ import annotations

import pandas as pd
import plotly.graph_objects as go

from models.schemas import TransactionRecord
from styles import BG_CARD, BG_DARK, EXPENSE, INCOME, INVESTMENT, PRIMARY, TEXT

_LAYOUT_BASE: dict = dict(
    paper_bgcolor=BG_DARK,
    plot_bgcolor=BG_CARD,
    font=dict(color=TEXT, size=13),
    margin=dict(l=16, r=16, t=36, b=16),
    legend=dict(bgcolor="rgba(0,0,0,0)"),
)


def _empty_figure(message: str = "Sem dados para o período") -> go.Figure:
    fig = go.Figure()
    fig.update_layout(
        **_LAYOUT_BASE,
        annotations=[dict(text=message, showarrow=False, font=dict(color=TEXT, size=14))],
    )
    return fig


def income_expense_bar(
    data: list[TransactionRecord],
    group_by: str = "month",
) -> go.Figure:
    """
    Gráfico de barras agrupadas: receitas vs despesas por período.

    Parâmetros:
      - group_by: 'month' | 'week' | 'day'
    Pós-condições:
      - Barras de receita em INCOME (#22c55e)
      - Barras de despesa em EXPENSE (#f87171)
    """
    if not data:
        return _empty_figure()

    df = pd.DataFrame([t.model_dump() for t in data])
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    freq_map = {"month": "ME", "week": "W", "day": "D"}
    freq = freq_map.get(group_by, "ME")

    income_df = (
        df[df["type"] == "receita"]
        .set_index("timestamp")["value"]
        .resample(freq)
        .sum()
        .reset_index()
    )
    expense_df = (
        df[df["type"] == "despesa"]
        .set_index("timestamp")["value"]
        .resample(freq)
        .sum()
        .reset_index()
    )

    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=income_df["timestamp"], y=income_df["value"],
        name="Receitas", marker_color=INCOME,
    ))
    fig.add_trace(go.Bar(
        x=expense_df["timestamp"], y=expense_df["value"],
        name="Despesas", marker_color=EXPENSE,
    ))
    fig.update_layout(**_LAYOUT_BASE, barmode="group", title="Receitas vs Despesas")
    return fig


def expense_donut(data: list[TransactionRecord]) -> go.Figure:
    """
    Donut chart de despesas por categoria.

    Pós-condições:
      - Cada fatia representa uma categoria.
      - Percentual exibido no hover.
    """
    expenses = [t for t in data if t.type == "despesa"]
    if not expenses:
        return _empty_figure("Sem despesas no período")

    df = pd.DataFrame([t.model_dump() for t in expenses])
    by_cat = df.groupby("category")["value"].sum().reset_index()

    fig = go.Figure(go.Pie(
        labels=by_cat["category"],
        values=by_cat["value"],
        hole=0.55,
        hovertemplate="%{label}: R$ %{value:,.2f} (%{percent})<extra></extra>",
    ))
    fig.update_layout(**_LAYOUT_BASE, title="Despesas por Categoria")
    return fig


def investment_timeline(data: list[TransactionRecord]) -> go.Figure:
    """
    Linha do tempo de aportes de investimento.

    Pós-condições:
      - Linha em INVESTMENT (#fbbf24)
      - Diferencia Individual vs Conjunto por marcador
    """
    investments = [t for t in data if t.investment_type in ("Individual", "Conjunto")]
    if not investments:
        return _empty_figure("Sem investimentos no período")

    df = pd.DataFrame([t.model_dump() for t in investments])
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("timestamp")

    symbol_map = {"Individual": "circle", "Conjunto": "diamond"}

    fig = go.Figure()
    for inv_type, group in df.groupby("investment_type"):
        fig.add_trace(go.Scatter(
            x=group["timestamp"],
            y=group["value"],
            mode="lines+markers",
            name=str(inv_type),
            line=dict(color=INVESTMENT),
            marker=dict(symbol=symbol_map.get(str(inv_type), "circle"), size=8),
            hovertemplate="%{x|%d/%m/%Y}<br>R$ %{y:,.2f}<extra>" + str(inv_type) + "</extra>",
        ))

    fig.update_layout(**_LAYOUT_BASE, title="Timeline de Investimentos")
    return fig


def balance_trend(data: list[TransactionRecord]) -> go.Figure:
    """
    Área acumulada do saldo ao longo do tempo.

    Pós-condições:
      - Área preenchida em PRIMARY (#4ade80) com opacidade 0.3
      - Linha sólida em PRIMARY
    """
    if not data:
        return _empty_figure()

    df = pd.DataFrame([t.model_dump() for t in data])
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["signed"] = df.apply(
        lambda r: r["value"] if r["type"] == "receita" else -r["value"], axis=1
    )
    df = df.sort_values("timestamp")
    df["cumulative"] = df["signed"].cumsum()

    fig = go.Figure(go.Scatter(
        x=df["timestamp"],
        y=df["cumulative"],
        mode="lines",
        fill="tozeroy",
        line=dict(color=PRIMARY, width=2),
        fillcolor=f"rgba(74, 222, 128, 0.15)",
        hovertemplate="%{x|%d/%m/%Y}<br>Saldo: R$ %{y:,.2f}<extra></extra>",
    ))
    fig.update_layout(**_LAYOUT_BASE, title="Evolução do Saldo")
    return fig
