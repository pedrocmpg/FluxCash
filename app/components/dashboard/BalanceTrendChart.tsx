'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Transaction } from '@/types/transaction';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { theme } from '@/styles/theme';

interface BalanceTrendChartProps {
  transactions: Transaction[];
}

function buildCumulativeBalance(transactions: Transaction[]) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  let balance = 0;
  return sorted.map((t) => {
    balance += t.type === 'receita' ? t.value : -t.value;
    return { date: t.timestamp, balance };
  });
}

export function BalanceTrendChart({ transactions }: BalanceTrendChartProps) {
  const data = buildCumulativeBalance(transactions);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-text-secondary">
        Sem dados para o período
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
        <XAxis
          dataKey="date"
          stroke={theme.colors.textSecondary}
          tickFormatter={(value) => formatDate(value)}
        />
        <YAxis
          stroke={theme.colors.textSecondary}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip
          labelFormatter={(value) => formatDate(value as string)}
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{
            background: theme.colors.bgCard,
            border: `1px solid ${theme.colors.border}`,
          }}
        />
        <Area type="monotone" dataKey="balance" stroke={theme.colors.primary} fill="#4ade8026" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
