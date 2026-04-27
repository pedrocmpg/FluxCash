from __future__ import annotations

from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):
    value: float = Field(gt=0)
    description: str = Field(min_length=1, max_length=200)
    category: str = "Outros"
    type: Literal["receita", "despesa"]
    investment_type: Literal["Individual", "Conjunto", "N/A"] = "N/A"


class TransactionRecord(TransactionCreate):
    id: UUID
    timestamp: datetime
    user_id: UUID | None = None


class DashboardSummary(BaseModel):
    total_income: float
    total_expense: float
    balance: float
    total_investment: float
    expense_by_category: dict[str, float]
    income_by_category: dict[str, float]
    period_start: date | None = None
    period_end: date | None = None
