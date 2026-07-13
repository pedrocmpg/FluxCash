import { render, screen } from '@testing-library/react';
import { KPICards } from '../KPICards';
import { DashboardSummary } from '@/types/summary';

describe('KPICards', () => {
  const mockSummary: DashboardSummary = {
    total_income: 5000,
    total_expense: 3000,
    balance: 2000,
    total_investment: 1000,
    expense_by_category: {},
    income_by_category: {},
  };

  it('renders all 4 KPI cards', () => {
    render(<KPICards summary={mockSummary} />);

    expect(screen.getByText(/Total Receitas/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Despesas/i)).toBeInTheDocument();
    expect(screen.getByText(/Saldo/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Investimentos/i)).toBeInTheDocument();
  });

  it('formats values as Brazilian Real', () => {
    render(<KPICards summary={mockSummary} />);

    expect(screen.getByText(/R\$\s*5\.000,00/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*3\.000,00/)).toBeInTheDocument();
  });

  it('displays loading skeleton when loading', () => {
    render(<KPICards summary={mockSummary} loading />);

    const skeletons = screen.getAllByRole('status');
    expect(skeletons.length).toBe(4);
  });
});
