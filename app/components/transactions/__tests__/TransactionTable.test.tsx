import { render, screen } from '@testing-library/react';
import { TransactionTable } from '../TransactionTable';
import { Transaction } from '@/types/transaction';

const transactions: Transaction[] = [
  {
    id: 'a1',
    value: 1000,
    description: 'Salário',
    category: 'Receita',
    type: 'receita',
    investment_type: 'N/A',
    timestamp: '2026-01-01T10:00:00Z',
  },
  {
    id: 'a2',
    value: 200,
    description: 'Aluguel #conjunto',
    category: 'Moradia',
    type: 'despesa',
    investment_type: 'Conjunto',
    timestamp: '2026-01-02T10:00:00Z',
  },
];

describe('TransactionTable', () => {
  it('shows empty state message when no transactions', () => {
    render(<TransactionTable transactions={[]} />);
    expect(screen.getByText('Nenhuma transação encontrada.')).toBeInTheDocument();
  });

  it('renders rows with formatted currency and date', () => {
    render(<TransactionTable transactions={transactions} />);
    expect(screen.getByText('Salário')).toBeInTheDocument();
    expect(screen.getAllByText(/R\$\s*1\.000,00/).length).toBeGreaterThan(0);
  });

  it('shows Conjunto badge for joint investments', () => {
    render(<TransactionTable transactions={transactions} />);
    expect(screen.getByText('Conjunto')).toBeInTheDocument();
  });

  it('renders summary row with totals', () => {
    render(<TransactionTable transactions={transactions} />);
    expect(screen.getByText(/R\$\s*800,00/)).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    render(<TransactionTable transactions={[]} loading />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
