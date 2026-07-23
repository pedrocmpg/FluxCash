import { DatabaseSync } from 'node:sqlite';
import { Category, Transaction } from '@/types/transaction';
import { CategoryEngine } from './categoryEngine';
import { MerchantRuleService } from './merchantRuleService';
import { TransactionService } from './transactionService';
import { ParsedStatementRow, parseStatementCsv } from './statementParser';

export interface StatementPreviewRow extends ParsedStatementRow {
  category: Category;
  categorySource: 'rule' | 'keyword' | 'none';
  duplicate: boolean;
}

export interface StatementPreviewResult {
  rows: StatementPreviewRow[];
  errors: string[];
}

export interface StatementImportRow {
  externalId: string;
  timestamp: string;
  description: string;
  value: number;
  type: ParsedStatementRow['type'];
  document: string | null;
  category: Category;
}

export interface StatementImportResult {
  imported: Transaction[];
  skipped: string[];
}

function existingExternalIds(db: DatabaseSync, externalIds: string[]): Set<string> {
  if (externalIds.length === 0) return new Set();

  const placeholders = externalIds.map((_, i) => `:id${i}`).join(', ');
  const params: Record<string, string> = {};
  externalIds.forEach((id, i) => {
    params[`id${i}`] = id;
  });

  const rows = db
    .prepare(`SELECT external_id FROM transactions WHERE external_id IN (${placeholders})`)
    .all(params) as { external_id: string }[];

  return new Set(rows.map((row) => row.external_id));
}

export class StatementImportService {
  static preview(db: DatabaseSync, csvContent: string): StatementPreviewResult {
    const { rows, errors } = parseStatementCsv(csvContent);
    const existing = existingExternalIds(
      db,
      rows.map((row) => row.externalId),
    );

    const previewRows: StatementPreviewRow[] = rows.map((row) => {
      const ruleCategory = row.document ? MerchantRuleService.getCategory(db, row.document) : null;
      const keywordCategory = ruleCategory ? null : CategoryEngine.suggestCategory(row.description);
      const category = ruleCategory ?? keywordCategory ?? 'Outros';
      const categorySource: StatementPreviewRow['categorySource'] = ruleCategory
        ? 'rule'
        : keywordCategory && keywordCategory !== 'Outros'
          ? 'keyword'
          : 'none';

      return {
        ...row,
        category,
        categorySource,
        duplicate: existing.has(row.externalId),
      };
    });

    return { rows: previewRows, errors };
  }

  static async confirm(
    db: DatabaseSync,
    rows: StatementImportRow[],
  ): Promise<StatementImportResult> {
    const existing = existingExternalIds(
      db,
      rows.map((row) => row.externalId),
    );

    const imported: Transaction[] = [];
    const skipped: string[] = [];

    for (const row of rows) {
      if (existing.has(row.externalId)) {
        skipped.push(row.externalId);
        continue;
      }

      const transaction = await TransactionService.createTransaction(db, {
        value: row.value,
        description: row.description,
        category: row.category,
        type: row.type,
        external_id: row.externalId,
        document: row.document,
        timestamp: row.timestamp,
      });

      imported.push(transaction);
      existing.add(row.externalId);
    }

    return { imported, skipped };
  }
}
