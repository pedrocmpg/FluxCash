import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/lib/test-utils/renderWithProviders';
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
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows empty state message when no transactions', () => {
    renderWithProviders(<TransactionTable transactions={[]} />);
    expect(screen.getByText('Nenhuma transação encontrada.')).toBeInTheDocument();
  });

  it('renders rows with formatted currency and date', () => {
    renderWithProviders(<TransactionTable transactions={transactions} />);
    expect(screen.getByText('Salário')).toBeInTheDocument();
    expect(screen.getAllByText(/R\$\s*1\.000,00/).length).toBeGreaterThan(0);
  });

  it('shows Conjunto badge for joint investments', () => {
    renderWithProviders(<TransactionTable transactions={transactions} />);
    expect(screen.getByText('Conjunto')).toBeInTheDocument();
  });

  it('renders summary row with totals', () => {
    renderWithProviders(<TransactionTable transactions={transactions} />);
    expect(screen.getByText(/R\$\s*800,00/)).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    renderWithProviders(<TransactionTable transactions={[]} loading />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('does not render a raw ID column', () => {
    renderWithProviders(<TransactionTable transactions={transactions} />);
    expect(screen.queryByText('ID')).not.toBeInTheDocument();
  });

  it('opens edit modal pre-filled when the edit action is clicked', () => {
    renderWithProviders(<TransactionTable transactions={transactions} />);
    fireEvent.click(screen.getByLabelText('Editar transação Salário'));

    expect(screen.getByRole('dialog', { name: 'Editar transação' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Salário')).toBeInTheDocument();
  });

  it('opens delete confirmation modal and deletes on confirm', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { message: 'ok' } }),
    }) as any;

    renderWithProviders(<TransactionTable transactions={transactions} />);
    fireEvent.click(screen.getByLabelText('Excluir transação Salário'));

    expect(screen.getByRole('dialog', { name: 'Excluir transação' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/transactions/a1', { method: 'DELETE' });
    });
  });
});
