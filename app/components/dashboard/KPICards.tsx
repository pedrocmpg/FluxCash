import { DashboardSummary } from '@/types/summary';
import { formatCurrency } from '@/lib/utils/formatters';

interface KPICardsProps {
  summary?: DashboardSummary;
  loading?: boolean;
}

const CARD_CONFIG = [
  { key: 'total_income', label: 'Total Receitas', icon: '💰', colorClass: 'text-income' },
  { key: 'total_expense', label: 'Total Despesas', icon: '💸', colorClass: 'text-expense' },
  { key: 'balance', label: 'Saldo', icon: '⚖️', colorClass: 'text-balance' },
  {
    key: 'total_investment',
    label: 'Total Investimentos',
    icon: '📈',
    colorClass: 'text-investment',
  },
] as const;

export function KPICards({ summary, loading = false }: KPICardsProps) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {CARD_CONFIG.map((card) => (
          <div
            key={card.key}
            role="status"
            className="animate-pulse rounded-[14px] border border-border bg-bg-card p-6"
          >
            <div className="mb-4 h-4 w-1/2 rounded bg-bg-hover" />
            <div className="h-8 w-3/4 rounded bg-bg-hover" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {CARD_CONFIG.map((card) => (
        <div key={card.key} className="rounded-[14px] border border-border bg-bg-card p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-text-secondary">{card.label}</span>
            <span aria-hidden>{card.icon}</span>
          </div>
          <span className={`text-2xl font-bold ${card.colorClass}`}>
            {formatCurrency(summary[card.key])}
          </span>
        </div>
      ))}
    </div>
  );
}
