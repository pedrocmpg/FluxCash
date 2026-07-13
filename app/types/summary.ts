export interface DashboardSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  total_investment: number;
  expense_by_category: Record<string, number>;
  income_by_category: Record<string, number>;
  period_start?: string;
  period_end?: string;
}
