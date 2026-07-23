'use client';

import { useRef, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { CATEGORIES, Category } from '@/types/transaction';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { useStatementImport, StatementPreviewRow } from '@/hooks/useStatementImport';
import { useToastContext } from '@/contexts/ToastContext';

export default function ImportPage() {
  const { showError } = useToastContext();
  const { preview, previewLoading, confirm, confirmLoading } = useStatementImport();
  const [rows, setRows] = useState<StatementPreviewRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const csv = await file.text();
    try {
      const result = await preview(csv);
      setRows(result.rows);
      setParseErrors(result.errors);
    } catch {
      // erro já mostrado via toast pelo hook
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCategoryChange = (externalId: string, category: Category) => {
    setRows((prev) => prev.map((row) => (row.externalId === externalId ? { ...row, category } : row)));
  };

  const handleConfirm = async () => {
    const toImport = rows.filter((row) => !row.duplicate);
    if (toImport.length === 0) {
      showError('Nenhuma transação nova para importar.');
      return;
    }

    try {
      await confirm(
        toImport.map((row) => ({
          externalId: row.externalId,
          timestamp: row.timestamp,
          description: row.description,
          value: row.value,
          type: row.type,
          document: row.document,
          category: row.category,
        })),
      );
      setRows([]);
    } catch {
      // erro já mostrado via toast pelo hook
    }
  };

  const newCount = rows.filter((row) => !row.duplicate).length;
  const duplicateCount = rows.length - newCount;

  return (
    <MainLayout>
      <div className="flex flex-col gap-7">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Importar extrato</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Envie o CSV do extrato bancário para revisar e importar as transações.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-bg-card p-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text">Arquivo CSV</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              disabled={previewLoading}
              className="text-sm text-text-secondary file:mr-3 file:rounded-xl file:border-0 file:bg-bg-hover file:px-3 file:py-2 file:text-sm file:text-text file:hover:bg-border/60"
            />
          </label>
          {previewLoading && <p className="mt-3 text-sm text-text-secondary">Analisando arquivo...</p>}
        </div>

        {parseErrors.length > 0 && (
          <div className="rounded-xl border border-expense/30 bg-expense/10 p-4 text-sm text-expense">
            <p className="font-medium">Algumas linhas não puderam ser lidas:</p>
            <ul className="mt-1 list-disc pl-5">
              {parseErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {rows.length > 0 && (
          <>
            <div className="flex items-center justify-between text-sm text-text-secondary">
              <span>
                {newCount} nova(s), {duplicateCount} duplicada(s) já importada(s)
              </span>
              <Button onClick={handleConfirm} loading={confirmLoading} disabled={newCount === 0}>
                Confirmar importação
              </Button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border/60 bg-bg-card">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs font-medium tracking-wide text-text-secondary uppercase">
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Descrição</th>
                    <th className="px-4 py-3 font-medium">Valor</th>
                    <th className="px-4 py-3 font-medium">Categoria</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.externalId}
                      className={`border-b border-border/60 last:border-0 ${
                        row.duplicate ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-text-secondary">
                        {formatDate(row.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-text">{row.description}</td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap font-medium ${
                          row.type === 'receita' ? 'text-income' : 'text-expense'
                        }`}
                      >
                        {formatCurrency(row.value)}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={row.category}
                          disabled={row.duplicate}
                          onChange={(e) =>
                            handleCategoryChange(row.externalId, e.target.value as Category)
                          }
                          className="min-w-[10rem]"
                        >
                          {CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        {row.duplicate ? (
                          <span className="rounded-full border border-border bg-bg-hover px-2 py-0.5 text-xs text-text-secondary">
                            Já importada
                          </span>
                        ) : row.categorySource === 'rule' ? (
                          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            Confirmada
                          </span>
                        ) : row.categorySource === 'keyword' ? (
                          <span className="rounded-full border border-investment/30 bg-investment/10 px-2 py-0.5 text-xs text-investment">
                            Sugestão
                          </span>
                        ) : (
                          <span className="rounded-full border border-expense/30 bg-expense/10 px-2 py-0.5 text-xs text-expense">
                            Revisar
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
