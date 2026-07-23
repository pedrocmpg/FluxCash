import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { Transaction, TransactionCreate } from '@/types/transaction';
import { PaginatedTransactions, TransactionFilters } from '@/types/api';
import { CategoryEngine } from './categoryEngine';
import { MerchantRuleService } from './merchantRuleService';

const MAX_RESULTS = 500;
const DEFAULT_PAGE_SIZE = 50;

function buildWhereClause(filters?: TransactionFilters) {
  const conditions: string[] = [];
  const params: Record<string, string> = {};

  if (filters?.start_date) {
    conditions.push('timestamp >= :start_date');
    params.start_date = filters.start_date;
  }
  if (filters?.end_date) {
    conditions.push('timestamp <= :end_date');
    params.end_date = `${filters.end_date}T23:59:59`;
  }
  if (filters?.type) {
    conditions.push('type = :type');
    params.type = filters.type;
  }
  if (filters?.category) {
    conditions.push('category = :category');
    params.category = filters.category;
  }
  if (filters?.search) {
    conditions.push('description LIKE :search');
    params.search = `%${filters.search}%`;
  }

  return {
    where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
}

export class TransactionService {
  static async getTransactions(
    db: DatabaseSync,
    filters?: TransactionFilters,
  ): Promise<Transaction[]> {
    const { where, params } = buildWhereClause(filters);
    const stmt = db.prepare(
      `SELECT * FROM transactions ${where} ORDER BY timestamp DESC LIMIT ${MAX_RESULTS}`,
    );

    const rows = stmt.all(params);
    return rows as unknown as Transaction[];
  }

  static async getTransactionsPage(
    db: DatabaseSync,
    filters?: TransactionFilters,
  ): Promise<PaginatedTransactions> {
    const { where, params } = buildWhereClause(filters);
    const page = filters?.page && filters.page > 0 ? filters.page : 1;
    const pageSize =
      filters?.page_size && filters.page_size > 0 ? filters.page_size : DEFAULT_PAGE_SIZE;
    const offset = (page - 1) * pageSize;

    const countRow = db.prepare(`SELECT COUNT(*) as count FROM transactions ${where}`).get(params) as {
      count: number;
    };

    const rows = db
      .prepare(
        `SELECT * FROM transactions ${where} ORDER BY timestamp DESC LIMIT :limit OFFSET :offset`,
      )
      .all({ ...params, limit: pageSize, offset });

    return {
      items: rows as unknown as Transaction[],
      total: countRow.count,
      page,
      page_size: pageSize,
    };
  }

  static async createTransaction(
    db: DatabaseSync,
    payload: TransactionCreate,
  ): Promise<Transaction> {
    const enriched = CategoryEngine.processTransaction(payload, db);
    const id = randomUUID();
    const timestamp = payload.timestamp ?? new Date().toISOString();

    const stmt = db.prepare(
      `INSERT INTO transactions (id, value, description, category, type, investment_type, timestamp, external_id)
       VALUES (:id, :value, :description, :category, :type, :investment_type, :timestamp, :external_id)`,
    );

    stmt.run({
      id,
      value: enriched.value,
      description: enriched.description,
      category: enriched.category!,
      type: enriched.type,
      investment_type: enriched.investment_type!,
      timestamp,
      external_id: enriched.external_id ?? null,
    });

    if (payload.document && payload.category && payload.category !== 'Outros') {
      MerchantRuleService.setCategory(db, payload.document, payload.category);
    }

    return { id, timestamp, ...enriched } as Transaction;
  }

  static async updateTransaction(
    db: DatabaseSync,
    id: string,
    payload: TransactionCreate,
  ): Promise<Transaction> {
    const existing = db
      .prepare('SELECT * FROM transactions WHERE id = :id')
      .get({ id }) as unknown as Transaction | undefined;

    if (!existing) {
      const notFound = new Error('Transaction not found');
      notFound.name = 'NotFoundError';
      throw notFound;
    }

    const enriched = CategoryEngine.processTransaction(payload, db);

    db.prepare(
      `UPDATE transactions
       SET value = :value, description = :description, category = :category,
           type = :type, investment_type = :investment_type
       WHERE id = :id`,
    ).run({
      id,
      value: enriched.value,
      description: enriched.description,
      category: enriched.category!,
      type: enriched.type,
      investment_type: enriched.investment_type!,
    });

    if (payload.document && payload.category && payload.category !== 'Outros') {
      MerchantRuleService.setCategory(db, payload.document, payload.category);
    }

    return { id, timestamp: existing.timestamp, ...enriched, external_id: existing.external_id } as Transaction;
  }

  static async deleteTransaction(db: DatabaseSync, id: string): Promise<void> {
    const existing = db.prepare('SELECT id FROM transactions WHERE id = :id').get({ id });

    if (!existing) {
      const notFound = new Error('Transaction not found');
      notFound.name = 'NotFoundError';
      throw notFound;
    }

    db.prepare('DELETE FROM transactions WHERE id = :id').run({ id });
  }
}
