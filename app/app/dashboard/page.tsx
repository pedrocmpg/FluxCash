'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout/MainLayout';
import { KPICards } from '@/components/dashboard/KPICards';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Input } from '@/components/ui/Input';
import { useSummary } from '@/hooks/useSummary';
import { useTransactions } from '@/hooks/useTransactions';

const IncomeExpenseBarChart = dynamic(
  () => import('@/components/dashboard/IncomeExpenseBarChart').then((m) => m.IncomeExpenseBarChart),
  { loading: () => <LoadingSpinner /> },
);
const ExpenseDonutChart = dynamic(
  () => import('@/components/dashboard/ExpenseDonutChart').then((m) => m.ExpenseDonutChart),
  { loading: () => <LoadingSpinner /> },
);
const BalanceTrendChart = dynamic(
  () => import('@/components/dashboard/BalanceTrendChart').then((m) => m.BalanceTrendChart),
  { loading: () => <LoadingSpinner /> },
);
const InvestmentTimelineChart = dynamic(
  () =>
    import('@/components/dashboard/InvestmentTimelineChart').then((m) => m.InvestmentTimelineChart),
  { loading: () => <LoadingSpinner /> },
);

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<{ start_date?: string; end_date?: string }>({});

  const { summary, isLoading: summaryLoading, error: summaryError } = useSummary(dateRange);
  const {
    transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useTransactions({ ...dateRange, page_size: 500 });

  const loading = summaryLoading || transactionsLoading;
  const error = summaryError || transactionsError;

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-4">
            <Input
              label="Data inicial"
              type="date"
              value={dateRange.start_date ?? ''}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start_date: e.target.value || undefined }))
              }
            />
            <Input
              label="Data final"
              type="date"
              value={dateRange.end_date ?? ''}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end_date: e.target.value || undefined }))
              }
            />
          </div>
        </div>

        {error && (
          <div className="rounded-[10px] border border-expense bg-expense/10 p-4 text-sm text-expense">
            {error.message}
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <KPICards summary={summary} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-[14px] border border-border bg-bg-card p-4">
                <h2 className="mb-4 font-semibold">Receitas x Despesas</h2>
                <IncomeExpenseBarChart transactions={transactions} />
              </div>
              <div className="rounded-[14px] border border-border bg-bg-card p-4">
                <h2 className="mb-4 font-semibold">Despesas por categoria</h2>
                <ExpenseDonutChart transactions={transactions} />
              </div>
              <div className="rounded-[14px] border border-border bg-bg-card p-4">
                <h2 className="mb-4 font-semibold">Evolução do saldo</h2>
                <BalanceTrendChart transactions={transactions} />
              </div>
              <div className="rounded-[14px] border border-border bg-bg-card p-4">
                <h2 className="mb-4 font-semibold">Investimentos</h2>
                <InvestmentTimelineChart transactions={transactions} />
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
