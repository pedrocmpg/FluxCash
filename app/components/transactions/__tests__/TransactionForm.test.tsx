import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '@/contexts/ToastContext';
import { TransactionForm } from '../TransactionForm';
import { Transaction } from '@/types/transaction';

function renderForm() {
  return render(
    <ToastProvider>
      <TransactionForm />
    </ToastProvider>,
  );
}

const existingTransaction: Transaction = {
  id: 'a1',
  value: 100,
  description: 'Mercado',
  category: 'Alimentação',
  type: 'despesa',
  investment_type: 'N/A',
  timestamp: '2026-01-01T10:00:00Z',
  external_id: null,
};

describe('TransactionForm', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows the #conjunto hint when the tag is typed', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Descrição'), {
      target: { value: 'Aluguel #conjunto' },
    });
    expect(
      screen.getByText('#conjunto detectado — o investimento será marcado como Conjunto.'),
    ).toBeInTheDocument();
  });

  it('does not show the hint without the tag', () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Compra normal' } });
    expect(
      screen.queryByText('#conjunto detectado — o investimento será marcado como Conjunto.'),
    ).not.toBeInTheDocument();
  });

  it('shows a validation error for a non-positive value', async () => {
    renderForm();
    fireEvent.change(screen.getByLabelText('Valor'), { target: { value: '-5' } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Teste' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar transação' }));

    await waitFor(() => {
      expect(screen.getByText('Value must be greater than zero')).toBeInTheDocument();
    });
  });

  it('submits successfully and clears the form', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 'new-id' } }),
    }) as any;

    renderForm();
    fireEvent.change(screen.getByLabelText('Valor'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Mercado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar transação' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/transactions',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  it('pre-fills fields and submits a PATCH when editing an existing transaction', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: existingTransaction }),
    }) as any;

    render(
      <ToastProvider>
        <TransactionForm transaction={existingTransaction} />
      </ToastProvider>,
    );

    expect(screen.getByDisplayValue('Mercado')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/transactions/a1',
        expect.objectContaining({ method: 'PATCH' }),
      );
    });
  });
});
