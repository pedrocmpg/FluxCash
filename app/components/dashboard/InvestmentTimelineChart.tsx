'use client';

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { Transaction } from '@/types/transaction';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { theme } from '@/styles/theme';

interface InvestmentTimelineChartProps {
  transactions: Transaction[];
}

function filterAndSort(transactions: Transaction[]) {
  return transactions
    .filter((t) => t.investment_type === 'Individual' || t.investment_type === 'Conjunto')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function InvestmentTimelineChart({ transactions }: InvestmentTimelineChartProps) {
  const data = filterAndSort(transactions).map((t, index) => ({
    index,
    date: t.timestamp,
    value: t.value,
    investment_type: t.investment_type,
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-text-secondary">
        Sem investimentos no período
      </div>
    );
  }

  const individual = data.filter((d) => d.investment_type === 'Individual');
  const conjunto = data.filter((d) => d.investment_type === 'Conjunto');

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
        <XAxis
          dataKey="index"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(index) => (data[index] ? formatDate(data[index].date) : '')}
          stroke={theme.colors.textSecondary}
        />
        <YAxis
          dataKey="value"
          stroke={theme.colors.textSecondary}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <ZAxis range={[80, 80]} />
        <Tooltip
          formatter={(value, _name, entry) => {
            const payload = entry.payload as { investment_type: string; date: string };
            return [
              `${formatCurrency(Number(value))} (${payload.investment_type})`,
              formatDate(payload.date),
            ];
          }}
          contentStyle={{
            background: theme.colors.bgCard,
            border: `1px solid ${theme.colors.border}`,
          }}
        />
        <Scatter
          name="Individual"
          data={individual}
          shape="circle"
          fill={theme.colors.investment}
          line
        />
        <Scatter
          name="Conjunto"
          data={conjunto}
          shape="diamond"
          fill={theme.colors.investment}
          line
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
