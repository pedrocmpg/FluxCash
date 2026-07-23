'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { Button } from '@/components/ui/Button';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionFilters as TransactionFiltersType } from '@/types/api';

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFiltersType>({});
  const [page, setPage] = useState(1);
  const { transactions, total, pageSize, isLoading, error, refetch } = useTransactions({
    ...filters,
    page,
  });

  const handleFiltersChange = (next: TransactionFiltersType) => {
    setFilters(next);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <MainLayout>
      <div className="flex flex-col gap-7">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Transações</h1>
          <p className="mt-1 text-sm text-text-secondary">Histórico e lançamento de movimentações</p>
        </div>

        <TransactionFilters filters={filters} onChange={handleFiltersChange} />

        {error && (
          <div className="rounded-xl border border-expense/30 bg-expense/10 p-4 text-sm text-expense">
            {error.message}
          </div>
        )}

        <TransactionTable transactions={transactions} loading={isLoading} />

        {total > 0 && (
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>
              Página {page} de {totalPages} ({total} transações)
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border/60 bg-bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-text">Nova transação</h2>
          <TransactionForm onSuccess={() => refetch()} />
        </div>
      </div>
    </MainLayout>
  );
}
