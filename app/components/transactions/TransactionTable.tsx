'use client';

import { useState } from 'react';
import { Transaction } from '@/types/transaction';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { useTransactionMutations } from '@/hooks/useTransactions';

interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
}

export function TransactionTable({ transactions, loading = false }: TransactionTableProps) {
  const { deleteTransaction } = useTransactionMutations();
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (loading) {
    return (
      <div
        role="status"
        className="animate-pulse rounded-2xl border border-border/60 bg-bg-card p-6"
      >
        <div className="h-40 rounded-xl bg-bg-hover" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-bg-card p-10 text-center text-text-secondary">
        <p className="text-sm font-medium text-text">Nenhuma transação encontrada</p>
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

  const handleConfirmDelete = () => {
    if (!deleting) return;
    setDeleteLoading(true);
    deleteTransaction(deleting.id, {
      onSettled: () => {
        setDeleteLoading(false);
        setDeleting(null);
      },
    });
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60 bg-bg-card">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border/60 text-left text-xs font-medium tracking-wide text-text-secondary uppercase">
            <th className="px-4 py-3 font-medium">Data</th>
            <th className="px-4 py-3 font-medium">Descrição</th>
            <th className="px-4 py-3 font-medium">Categoria</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Valor</th>
            <th className="px-4 py-3 font-medium">Investimento</th>
            <th className="px-4 py-3 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-bg-hover/50">
              <td className="px-4 py-3 whitespace-nowrap text-text-secondary">{formatDateTime(t.timestamp)}</td>
              <td className="px-4 py-3 text-text">{t.description}</td>
              <td className="px-4 py-3 text-text-secondary">{t.category}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    t.type === 'receita' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
                  }`}
                >
                  {t.type}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap font-medium text-text">{formatCurrency(t.value)}</td>
              <td className="px-4 py-3">
                {t.investment_type === 'Conjunto' ? (
                  <span className="rounded-full border border-investment/30 bg-investment/10 px-2 py-0.5 text-xs text-investment">
                    Conjunto
                  </span>
                ) : (
                  <span className="text-text-secondary">{t.investment_type}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label={`Editar transação ${t.description}`}
                    onClick={() => setEditing(t)}
                    className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text"
                  >
                    <PencilIcon />
                  </button>
                  <button
                    type="button"
                    aria-label={`Excluir transação ${t.description}`}
                    onClick={() => setDeleting(t)}
                    className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-expense/10 hover:text-expense"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-border/60 font-medium">
            <td className="px-4 py-3 text-text-secondary" colSpan={3}>
              Resumo
            </td>
            <td className="px-4 py-3 text-income">{formatCurrency(totalReceitas)}</td>
            <td className="px-4 py-3 text-expense">{formatCurrency(totalDespesas)}</td>
            <td className="px-4 py-3 text-balance">{formatCurrency(saldo)}</td>
            <td className="px-4 py-3"></td>
          </tr>
        </tfoot>
      </table>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Editar transação">
        {editing && (
          <TransactionForm
            transaction={editing}
            onSuccess={() => setEditing(null)}
          />
        )}
      </Modal>

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Excluir transação"
      >
        {deleting && (
          <div className="flex flex-col gap-4">
            <p className="text-sm">
              Tem certeza que deseja excluir a transação{' '}
              <span className="font-medium">&quot;{deleting.description}&quot;</span> de{' '}
              {formatCurrency(deleting.value)}? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setDeleting(null)}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                loading={deleteLoading}
                onClick={handleConfirmDelete}
              >
                Excluir
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
