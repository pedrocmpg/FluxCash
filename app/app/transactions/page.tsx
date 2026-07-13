'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { DeleteTransactionForm } from '@/components/transactions/DeleteTransactionForm';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionFilters as TransactionFiltersType } from '@/types/api';

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFiltersType>({});
  const { transactions, isLoading, error, refetch } = useTransactions(filters);

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Transações</h1>

        <TransactionFilters filters={filters} onChange={setFilters} />

        {error && (
          <div className="rounded-[10px] border border-expense bg-expense/10 p-4 text-sm text-expense">
            {error.message}
          </div>
        )}

        <TransactionTable transactions={transactions} loading={isLoading} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-[14px] border border-border bg-bg-card p-4">
            <h2 className="mb-4 font-semibold">Nova transação</h2>
            <TransactionForm onSuccess={() => refetch()} />
          </div>
          <DeleteTransactionForm onSuccess={() => refetch()} />
        </div>
      </div>
    </MainLayout>
  );
}
