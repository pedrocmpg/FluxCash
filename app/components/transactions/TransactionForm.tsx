'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TransactionCreateSchema } from '@/lib/validation/schemas';
import { CATEGORIES } from '@/types/transaction';
import { Transaction } from '@/types/transaction';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToastContext } from '@/contexts/ToastContext';

type TransactionFormData = z.infer<typeof TransactionCreateSchema>;

interface TransactionFormProps {
  transaction?: Transaction;
  onSuccess?: (transaction: Transaction) => void;
}

const CONJUNTO_REGEX = /#conjunto\b/i;

export function TransactionForm({ transaction, onSuccess }: TransactionFormProps) {
  const { showSuccess, showError } = useToastContext();
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(transaction);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(TransactionCreateSchema),
    defaultValues: transaction
      ? {
          value: transaction.value,
          description: transaction.description,
          category: transaction.category,
          type: transaction.type,
          investment_type: transaction.investment_type,
        }
      : { investment_type: 'N/A', type: 'despesa' },
  });

  const description = watch('description') ?? '';
  const showConjuntoHint = CONJUNTO_REGEX.test(description);

  const onSubmit = async (data: TransactionFormData) => {
    setLoading(true);
    try {
      const url = isEditing ? `/api/transactions/${transaction!.id}` : '/api/transactions';
      const method = isEditing ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        showError(result.error || (isEditing ? 'Erro ao atualizar transação' : 'Erro ao criar transação'));
        return;
      }

      showSuccess(isEditing ? 'Transação atualizada com sucesso' : 'Transação criada com sucesso');
      if (!isEditing) {
        reset({ investment_type: 'N/A', type: 'despesa', value: undefined, description: '' });
      }
      onSuccess?.(result.data);
    } catch {
      showError('Erro no servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Valor"
        type="number"
        step="0.01"
        error={errors.value?.message}
        {...register('value', { valueAsNumber: true })}
      />
      <Input label="Descrição" error={errors.description?.message} {...register('description')} />
      {showConjuntoHint && (
        <p className="text-xs text-investment">
          #conjunto detectado — o investimento será marcado como Conjunto.
        </p>
      )}
      <Select label="Categoria" error={errors.category?.message} {...register('category')}>
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" value="receita" {...register('type')} /> Receita
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" value="despesa" {...register('type')} /> Despesa
        </label>
      </div>
      <Select label="Tipo de investimento" {...register('investment_type')}>
        <option value="N/A">N/A</option>
        <option value="Individual">Individual</option>
        <option value="Conjunto">Conjunto</option>
      </Select>
      <Button type="submit" loading={loading}>
        {isEditing ? 'Salvar alterações' : 'Adicionar transação'}
      </Button>
    </form>
  );
}
