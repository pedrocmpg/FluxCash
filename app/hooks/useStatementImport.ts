'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Category, Transaction, TransactionType } from '@/types/transaction';
import { useToast } from './useToast';

export interface StatementPreviewRow {
  timestamp: string;
  description: string;
  value: number;
  type: TransactionType;
  externalId: string;
  document: string | null;
  category: Category;
  categorySource: 'rule' | 'keyword' | 'none';
  duplicate: boolean;
}

export interface StatementImportRow {
  externalId: string;
  timestamp: string;
  description: string;
  value: number;
  type: TransactionType;
  document: string | null;
  category: Category;
}

interface PreviewResult {
  rows: StatementPreviewRow[];
  errors: string[];
}

interface ConfirmResult {
  imported: Transaction[];
  skipped: string[];
}

async function previewStatement(csv: string): Promise<PreviewResult> {
  const response = await fetch('/api/import/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csv }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Falha ao analisar o extrato');
  return result.data;
}

async function confirmStatement(rows: StatementImportRow[]): Promise<ConfirmResult> {
  const response = await fetch('/api/import/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Falha ao importar transações');
  return result.data;
}

export function useStatementImport() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const previewMutation = useMutation({
    mutationFn: previewStatement,
    onError: (err: Error) => showError(err.message),
  });

  const confirmMutation = useMutation({
    mutationFn: confirmStatement,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      showSuccess(
        `${result.imported.length} transações importadas` +
          (result.skipped.length > 0 ? `, ${result.skipped.length} duplicadas ignoradas` : ''),
      );
    },
    onError: (err: Error) => showError(err.message),
  });

  return {
    preview: previewMutation.mutateAsync,
    previewLoading: previewMutation.isPending,
    confirm: confirmMutation.mutateAsync,
    confirmLoading: confirmMutation.isPending,
  };
}
