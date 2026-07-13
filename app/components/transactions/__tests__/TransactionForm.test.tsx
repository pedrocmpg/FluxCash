import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '@/contexts/ToastContext';
import { TransactionForm } from '../TransactionForm';

function renderForm() {
  return render(
    <ToastProvider>
      <TransactionForm />
    </ToastProvider>,
  );
}

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
});
