import { ReactNode } from 'react';
import { DashboardSummary } from '@/types/summary';
import { formatCurrency } from '@/lib/utils/formatters';

interface KPICardsProps {
  summary?: DashboardSummary;
  loading?: boolean;
}

const CARD_CONFIG = [
  { key: 'total_income', label: 'Total Receitas', icon: IncomeIcon, colorClass: 'text-income' },
  { key: 'total_expense', label: 'Total Despesas', icon: ExpenseIcon, colorClass: 'text-expense' },
  { key: 'balance', label: 'Saldo', icon: BalanceIcon, colorClass: 'text-balance' },
  {
    key: 'total_investment',
    label: 'Total Investimentos',
    icon: InvestmentIcon,
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
            className="animate-pulse rounded-2xl border border-border/60 bg-bg-card p-5"
          >
            <div className="mb-4 h-3.5 w-1/2 rounded bg-bg-hover" />
            <div className="h-7 w-3/4 rounded bg-bg-hover" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {CARD_CONFIG.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="rounded-2xl border border-border/60 bg-bg-card p-5 transition-colors hover:border-border"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium tracking-wide text-text-secondary uppercase">
                {card.label}
              </span>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-bg-hover ${card.colorClass}`}>
                <Icon />
              </span>
            </div>
            <span className={`text-2xl font-semibold tracking-tight ${card.colorClass}`}>
              {formatCurrency(summary[card.key])}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function iconProps() {
  return { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 } as const;
}

function IncomeIcon(): ReactNode {
  return (
    <svg {...iconProps()}>
      <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExpenseIcon(): ReactNode {
  return (
    <svg {...iconProps()}>
      <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BalanceIcon(): ReactNode {
  return (
    <svg {...iconProps()}>
      <path d="M3 12h18M7 6l-4 6 4 6M17 6l4 6-4 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InvestmentIcon(): ReactNode {
  return (
    <svg {...iconProps()}>
      <path d="M3 17l6-6 4 4 8-8M21 7v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
