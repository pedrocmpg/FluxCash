import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { Transaction, TransactionCreate } from '@/types/transaction';
import { TransactionFilters } from '@/types/api';
import { CategoryEngine } from './categoryEngine';

const MAX_RESULTS = 500;

export class TransactionService {
  static async getTransactions(
    db: DatabaseSync,
    filters?: TransactionFilters,
  ): Promise<Transaction[]> {
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

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const stmt = db.prepare(
      `SELECT * FROM transactions ${where} ORDER BY timestamp DESC LIMIT ${MAX_RESULTS}`,
    );

    const rows = stmt.all(params);
    return rows as unknown as Transaction[];
  }

  static async createTransaction(
    db: DatabaseSync,
    payload: TransactionCreate,
  ): Promise<Transaction> {
    const enriched = CategoryEngine.processTransaction(payload);
    const id = randomUUID();
    const timestamp = new Date().toISOString();

    const stmt = db.prepare(
      `INSERT INTO transactions (id, value, description, category, type, investment_type, timestamp)
       VALUES (:id, :value, :description, :category, :type, :investment_type, :timestamp)`,
    );

    stmt.run({
      id,
      value: enriched.value,
      description: enriched.description,
      category: enriched.category!,
      type: enriched.type,
      investment_type: enriched.investment_type!,
      timestamp,
    });

    return { id, timestamp, ...enriched } as Transaction;
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
