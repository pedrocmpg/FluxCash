import { Transaction } from '@/types/transaction';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters';

interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
}

export function TransactionTable({ transactions, loading = false }: TransactionTableProps) {
  if (loading) {
    return (
      <div
        role="status"
        className="animate-pulse rounded-[10px] border border-border bg-bg-card p-6"
      >
        <div className="h-40 rounded bg-bg-hover" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-[10px] border border-border bg-bg-card p-8 text-center text-text-secondary">
        <p>Nenhuma transação encontrada.</p>
        <p className="mt-1 text-sm">Ajuste os filtros ou adicione uma nova transação.</p>
      </div>
    );
  }

  const totalReceitas = transactions
    .filter((t) => t.type === 'receita')
    .reduce((sum, t) => sum + t.value, 0);
  const totalDespesas = transactions
    .filter((t) => t.type === 'despesa')
    .reduce((sum, t) => sum + t.value, 0);
  const saldo = totalReceitas - totalDespesas;

  return (
    <div className="overflow-x-auto rounded-[10px] border border-border">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-bg-card text-left text-text-secondary">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Descrição</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Valor (R$)</th>
            <th className="px-4 py-3">Investimento</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-mono text-xs text-text-secondary">{t.id}</td>
              <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(t.timestamp)}</td>
              <td className="px-4 py-3">{t.description}</td>
              <td className="px-4 py-3">{t.category}</td>
              <td
                className={`px-4 py-3 font-medium ${t.type === 'receita' ? 'text-income' : 'text-expense'}`}
              >
                {t.type}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(t.value)}</td>
              <td className="px-4 py-3">
                {t.investment_type === 'Conjunto' ? (
                  <span className="rounded-full border border-investment px-2 py-0.5 text-xs text-investment">
                    Conjunto
                  </span>
                ) : (
                  t.investment_type
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-bg-card font-medium">
            <td className="px-4 py-3" colSpan={4}>
              Resumo
            </td>
            <td className="px-4 py-3 text-income">{formatCurrency(totalReceitas)}</td>
            <td className="px-4 py-3 text-expense">{formatCurrency(totalDespesas)}</td>
            <td className="px-4 py-3 text-balance">{formatCurrency(saldo)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
