'use client';

import { useState } from 'react';
import { UUIDSchema } from '@/lib/validation/schemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToastContext } from '@/contexts/ToastContext';

interface DeleteTransactionFormProps {
  onSuccess?: () => void;
}

export function DeleteTransactionForm({ onSuccess }: DeleteTransactionFormProps) {
  const { showSuccess, showError } = useToastContext();
  const [open, setOpen] = useState(false);
  const [id, setId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const uuidResult = UUIDSchema.safeParse(id);
  const isValidUuid = id.length === 0 || uuidResult.success;

  const handleDelete = async () => {
    if (!uuidResult.success || !confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      const result = await response.json();

      if (!response.ok) {
        showError(result.error || 'Erro ao excluir transação');
        return;
      }

      showSuccess('✅ Transação excluída');
      setId('');
      setConfirmed(false);
      onSuccess?.();
    } catch {
      showError('Erro no servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[10px] border border-border bg-bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
      >
        Excluir transação
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-3 border-t border-border p-4">
          <Input
            label="ID da transação"
            value={id}
            onChange={(e) => setId(e.target.value)}
            error={
              !isValidUuid ? '❌ ID inválido. Use o formato UUID exibido na tabela' : undefined
            }
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            Confirmar exclusão
          </label>
          {confirmed && (
            <p className="text-xs text-expense">⚠️ A transação será removida permanentemente</p>
          )}
          <Button
            type="button"
            variant="danger"
            disabled={!uuidResult.success || !confirmed}
            loading={loading}
            onClick={handleDelete}
          >
            Excluir
          </Button>
        </div>
      )}
    </div>
  );
}
