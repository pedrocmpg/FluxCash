'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction } from '@/types/transaction';
import { formatCurrency } from '@/lib/utils/formatters';
import { theme } from '@/styles/theme';

interface ExpenseDonutChartProps {
  transactions: Transaction[];
}

const FALLBACK_COLORS = [
  '#4ade80',
  '#60a5fa',
  '#fbbf24',
  '#f87171',
  '#a78bfa',
  '#38bdf8',
  '#34d399',
  '#8b949e',
];

function aggregateByCategory(transactions: Transaction[]) {
  const totals = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== 'despesa') continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.value);
  }
  return Array.from(totals.entries()).map(([name, value]) => ({ name, value }));
}

export function ExpenseDonutChart({ transactions }: ExpenseDonutChartProps) {
  const data = aggregateByCategory(transactions);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-text-secondary">
        Sem despesas no período
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={
                (theme.categoryColors as Record<string, string>)[entry.name] ??
                FALLBACK_COLORS[index % FALLBACK_COLORS.length]
              }
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => {
            const numericValue = Number(value);
            return [
              `${formatCurrency(numericValue)} (${((numericValue / total) * 100).toFixed(1)}%)`,
              name,
            ];
          }}
          contentStyle={{
            background: theme.colors.bgCard,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '12px',
            fontSize: '13px',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
