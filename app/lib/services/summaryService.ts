import { DatabaseSync } from 'node:sqlite';
import { DashboardSummary } from '@/types/summary';
import { TransactionFilters } from '@/types/api';
import { TransactionService } from './transactionService';

export class SummaryService {
  static async getSummary(
    db: DatabaseSync,
    filters?: Pick<TransactionFilters, 'start_date' | 'end_date'>,
  ): Promise<DashboardSummary> {
    const transactions = await TransactionService.getTransactions(db, filters);

    let total_income = 0;
    let total_expense = 0;
    let total_investment = 0;
    const expense_by_category: Record<string, number> = {};
    const income_by_category: Record<string, number> = {};

    for (const t of transactions) {
      if (t.type === 'receita') {
        total_income += t.value;
        income_by_category[t.category] = (income_by_category[t.category] ?? 0) + t.value;
      } else {
        total_expense += t.value;
        expense_by_category[t.category] = (expense_by_category[t.category] ?? 0) + t.value;
      }

      if (t.investment_type === 'Individual' || t.investment_type === 'Conjunto') {
        total_investment += t.value;
      }
    }

    return {
      total_income,
      total_expense,
      balance: total_income - total_expense,
      total_investment,
      expense_by_category,
      income_by_category,
      period_start: filters?.start_date,
      period_end: filters?.end_date,
    };
  }
}
