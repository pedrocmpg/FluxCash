import { SummaryService } from '../summaryService';
import { TransactionService } from '../transactionService';
import { Transaction } from '@/types/transaction';

jest.mock('../transactionService');

const mockGetTransactions = TransactionService.getTransactions as jest.Mock;

describe('SummaryService', () => {
  afterEach(() => jest.clearAllMocks());

  it('calculates totals and balance', async () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        value: 1000,
        description: 'Salário',
        category: 'Receita',
        type: 'receita',
        investment_type: 'N/A',
        timestamp: '2026-01-01T00:00:00Z',
      },
      {
        id: '2',
        value: 300,
        description: 'Mercado',
        category: 'Alimentação',
        type: 'despesa',
        investment_type: 'N/A',
        timestamp: '2026-01-02T00:00:00Z',
      },
      {
        id: '3',
        value: 200,
        description: 'CDB #conjunto',
        category: 'Investimento',
        type: 'despesa',
        investment_type: 'Conjunto',
        timestamp: '2026-01-03T00:00:00Z',
      },
    ];
    mockGetTransactions.mockResolvedValue(transactions);

    const summary = await SummaryService.getSummary({} as any);

    expect(summary.total_income).toBe(1000);
    expect(summary.total_expense).toBe(500);
    expect(summary.balance).toBe(500);
    expect(summary.total_investment).toBe(200);
    expect(summary.expense_by_category['Alimentação']).toBe(300);
    expect(summary.income_by_category['Receita']).toBe(1000);
  });

  it('returns zeroed summary when no transactions', async () => {
    mockGetTransactions.mockResolvedValue([]);

    const summary = await SummaryService.getSummary({} as any);

    expect(summary.total_income).toBe(0);
    expect(summary.total_expense).toBe(0);
    expect(summary.balance).toBe(0);
    expect(summary.total_investment).toBe(0);
  });

  it('passes date range filters through and echoes them in the result', async () => {
    mockGetTransactions.mockResolvedValue([]);

    const summary = await SummaryService.getSummary({} as any, {
      start_date: '2026-01-01',
      end_date: '2026-01-31',
    });

    expect(mockGetTransactions).toHaveBeenCalledWith(
      {},
      { start_date: '2026-01-01', end_date: '2026-01-31' },
    );
    expect(summary.period_start).toBe('2026-01-01');
    expect(summary.period_end).toBe('2026-01-31');
  });
});
