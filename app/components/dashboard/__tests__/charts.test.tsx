import { render, screen } from '@testing-library/react';
import { IncomeExpenseBarChart } from '../IncomeExpenseBarChart';
import { ExpenseDonutChart } from '../ExpenseDonutChart';
import { BalanceTrendChart } from '../BalanceTrendChart';
import { InvestmentTimelineChart } from '../InvestmentTimelineChart';
import { Transaction } from '@/types/transaction';

beforeAll(() => {
  // Recharts' ResponsiveContainer needs a real layout, which jsdom lacks.
  (global as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const baseTransaction: Transaction = {
  id: '1',
  value: 100,
  description: 'x',
  category: 'Outros',
  type: 'receita',
  investment_type: 'N/A',
  timestamp: '2026-01-01T00:00:00Z',
  user_id: 'u1',
};

describe('IncomeExpenseBarChart', () => {
  it('shows empty state message when no transactions', () => {
    render(<IncomeExpenseBarChart transactions={[]} />);
    expect(screen.getByText('Sem dados para o período')).toBeInTheDocument();
  });

  it('renders chart container when transactions exist', () => {
    const { container } = render(<IncomeExpenseBarChart transactions={[baseTransaction]} />);
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });
});

describe('ExpenseDonutChart', () => {
  it('shows empty state message when no expenses', () => {
    render(<ExpenseDonutChart transactions={[{ ...baseTransaction, type: 'receita' }]} />);
    expect(screen.getByText('Sem despesas no período')).toBeInTheDocument();
  });

  it('renders chart when expenses exist', () => {
    const { container } = render(
      <ExpenseDonutChart
        transactions={[{ ...baseTransaction, type: 'despesa', category: 'Alimentação' }]}
      />,
    );
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });
});

describe('BalanceTrendChart', () => {
  it('shows empty state message with no transactions', () => {
    render(<BalanceTrendChart transactions={[]} />);
    expect(screen.getByText('Sem dados para o período')).toBeInTheDocument();
  });

  it('renders chart with transactions', () => {
    const { container } = render(<BalanceTrendChart transactions={[baseTransaction]} />);
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });
});

describe('InvestmentTimelineChart', () => {
  it('shows empty state message when no investments', () => {
    render(<InvestmentTimelineChart transactions={[baseTransaction]} />);
    expect(screen.getByText('Sem investimentos no período')).toBeInTheDocument();
  });

  it('renders chart when investment transactions exist', () => {
    const { container } = render(
      <InvestmentTimelineChart
        transactions={[{ ...baseTransaction, investment_type: 'Individual' }]}
      />,
    );
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('renders without crashing when both Individual and Conjunto transactions are present', () => {
    const transactions = [
      { ...baseTransaction, id: '1', investment_type: 'Individual' as const },
      { ...baseTransaction, id: '2', investment_type: 'Conjunto' as const },
    ];
    const { container } = render(<InvestmentTimelineChart transactions={transactions} />);
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });
});
