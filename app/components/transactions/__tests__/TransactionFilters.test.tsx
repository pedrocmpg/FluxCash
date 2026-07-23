import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionFilters } from '../TransactionFilters';

describe('TransactionFilters', () => {
  it('emits onChange when a filter changes', () => {
    const onChange = jest.fn();
    render(<TransactionFilters filters={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-01-01' } });
    expect(onChange).toHaveBeenCalledWith({ start_date: '2026-01-01' });
  });

  it('shows active filter count badge', () => {
    render(<TransactionFilters filters={{ type: 'receita' }} onChange={jest.fn()} />);
    expect(screen.getByText('1 filtro')).toBeInTheDocument();
  });

  it('clears filters when clear button is clicked', () => {
    const onChange = jest.fn();
    render(<TransactionFilters filters={{ type: 'receita' }} onChange={onChange} />);
    fireEvent.click(screen.getByText('Limpar filtros'));
    expect(onChange).toHaveBeenCalledWith({});
  });

  it('shows validation error when start_date is after end_date', () => {
    render(
      <TransactionFilters
        filters={{ start_date: '2026-02-01', end_date: '2026-01-01' }}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByText('Data inicial deve ser anterior à data final')).toBeInTheDocument();
  });

  it('emits onChange when category filter changes', () => {
    const onChange = jest.fn();
    render(<TransactionFilters filters={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'Transporte' } });
    expect(onChange).toHaveBeenCalledWith({ category: 'Transporte' });
  });

  it('emits onChange when search text changes', () => {
    const onChange = jest.fn();
    render(<TransactionFilters filters={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Buscar na descrição'), {
      target: { value: 'mercado' },
    });
    expect(onChange).toHaveBeenCalledWith({ search: 'mercado' });
  });
});
