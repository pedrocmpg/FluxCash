'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Transaction, TransactionCreate } from '@/types/transaction';
import { TransactionFilters } from '@/types/api';
import { useToast } from './useToast';

async function fetchTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (filters?.start_date) params.set('start_date', filters.start_date);
  if (filters?.end_date) params.set('end_date', filters.end_date);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.category) params.set('category', filters.category);

  const response = await fetch(`/api/transactions?${params.toString()}`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to load transactions');
  return result.data;
}

async function postTransaction(payload: TransactionCreate): Promise<Transaction> {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to create transaction');
  return result.data;
}

async function removeTransaction(id: string): Promise<void> {
  const response = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to delete transaction');
}

export function useTransactions(filters?: TransactionFilters) {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => fetchTransactions(filters),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['summary'] });
  };

  const createMutation = useMutation({
    mutationFn: postTransaction,
    onSuccess: () => {
      invalidate();
      showSuccess('✅ Transação criada com sucesso');
    },
    onError: (err: Error) => showError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: removeTransaction,
    onSuccess: () => {
      invalidate();
      showSuccess('✅ Transação excluída');
    },
    onError: (err: Error) => showError(err.message),
  });

  return {
    transactions: data ?? [],
    isLoading,
    error: error as Error | null,
    refetch,
    createTransaction: createMutation.mutate,
    deleteTransaction: deleteMutation.mutate,
  };
}
