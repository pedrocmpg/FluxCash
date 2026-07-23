'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Transaction, TransactionCreate } from '@/types/transaction';
import { PaginatedTransactions, TransactionFilters } from '@/types/api';
import { useToast } from './useToast';

interface UpdateTransactionInput {
  id: string;
  payload: TransactionCreate;
}

async function fetchTransactions(filters?: TransactionFilters): Promise<PaginatedTransactions> {
  const params = new URLSearchParams();
  if (filters?.start_date) params.set('start_date', filters.start_date);
  if (filters?.end_date) params.set('end_date', filters.end_date);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.page_size) params.set('page_size', String(filters.page_size));

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

async function patchTransaction({ id, payload }: UpdateTransactionInput): Promise<Transaction> {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to update transaction');
  return result.data;
}

export function useTransactionMutations() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['summary'] });
  };

  const createMutation = useMutation({
    mutationFn: postTransaction,
    onSuccess: () => {
      invalidate();
      showSuccess('Transação criada com sucesso');
    },
    onError: (err: Error) => showError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: patchTransaction,
    onSuccess: () => {
      invalidate();
      showSuccess('Transação atualizada com sucesso');
    },
    onError: (err: Error) => showError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: removeTransaction,
    onSuccess: () => {
      invalidate();
      showSuccess('Transação excluída');
    },
    onError: (err: Error) => showError(err.message),
  });

  return {
    createTransaction: createMutation.mutate,
    updateTransaction: updateMutation.mutate,
    deleteTransaction: deleteMutation.mutate,
  };
}

export function useTransactions(filters?: TransactionFilters) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => fetchTransactions(filters),
  });

  const mutations = useTransactionMutations();

  return {
    transactions: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    pageSize: data?.page_size ?? 50,
    isLoading,
    error: error as Error | null,
    refetch,
    ...mutations,
  };
}
