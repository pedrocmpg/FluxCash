'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/lib/utils/formatters';
import { theme } from '@/styles/theme';

interface IncomeExpenseBarChartProps {
  transactions: Transaction[];
}

interface MonthlyTotal {
  month: string;
  receita: number;
  despesa: number;
}

function groupByMonth(transactions: Transaction[]): MonthlyTotal[] {
  const groups = new Map<string, MonthlyTotal>();

  for (const t of transactions) {
    const date = new Date(t.timestamp);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

    const group = groups.get(key) ?? { month: label, receita: 0, despesa: 0 };
    if (t.type === 'receita') {
      group.receita += t.value;
    } else {
      group.despesa += t.value;
    }
    groups.set(key, group);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);
}

export function IncomeExpenseBarChart({ transactions }: IncomeExpenseBarChartProps) {
  const data = groupByMonth(transactions);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-text-secondary">
        Sem dados para o período
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
        <XAxis dataKey="month" stroke={theme.colors.textSecondary} />
        <YAxis
          stroke={theme.colors.textSecondary}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{
            background: theme.colors.bgCard,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '12px',
            fontSize: '13px',
          }}
        />
        <Legend />
        <Bar dataKey="receita" name="Receita" fill={theme.colors.income} />
        <Bar dataKey="despesa" name="Despesa" fill={theme.colors.expense} />
      </BarChart>
    </ResponsiveContainer>
  );
}
