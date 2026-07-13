import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider } from '@/contexts/ToastContext';
import { DeleteTransactionForm } from '../DeleteTransactionForm';

function renderForm() {
  return render(
    <ToastProvider>
      <DeleteTransactionForm />
    </ToastProvider>,
  );
}

describe('DeleteTransactionForm', () => {
  it('expands the section on click', () => {
    renderForm();
    fireEvent.click(screen.getByText('Excluir transação'));
    expect(screen.getByLabelText('ID da transação')).toBeInTheDocument();
  });

  it('shows a validation error for an invalid UUID', () => {
    renderForm();
    fireEvent.click(screen.getByText('Excluir transação'));
    fireEvent.change(screen.getByLabelText('ID da transação'), { target: { value: 'not-a-uuid' } });
    expect(
      screen.getByText('❌ ID inválido. Use o formato UUID exibido na tabela'),
    ).toBeInTheDocument();
  });

  it('requires the confirmation checkbox before enabling delete', () => {
    renderForm();
    fireEvent.click(screen.getByText('Excluir transação'));
    fireEvent.change(screen.getByLabelText('ID da transação'), {
      target: { value: '123e4567-e89b-12d3-a456-426614174000' },
    });
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeDisabled();

    fireEvent.click(screen.getByLabelText('Confirmar exclusão'));
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeEnabled();
    expect(screen.getByText('⚠️ A transação será removida permanentemente')).toBeInTheDocument();
  });
});
