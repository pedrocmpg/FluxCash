import { DatabaseSync } from 'node:sqlite';
import { TransactionService } from '../transactionService';

function makeTestDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE transactions (
      id TEXT PRIMARY KEY,
      value REAL NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      investment_type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      external_id TEXT
    )
  `);
  db.exec(`
    CREATE TABLE merchant_rules (
      document TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  return db;
}

describe('TransactionService', () => {
  describe('getTransactions', () => {
    it('returns transactions ordered by most recent', async () => {
      const db = makeTestDb();
      await TransactionService.createTransaction(db, {
        value: 100,
        description: 'A',
        type: 'receita',
      });
      await TransactionService.createTransaction(db, {
        value: 200,
        description: 'B',
        type: 'despesa',
      });

      const result = await TransactionService.getTransactions(db);
      expect(result).toHaveLength(2);
    });

    it('applies date and type filters', async () => {
      const db = makeTestDb();
      db.prepare(
        `INSERT INTO transactions (id, value, description, category, type, investment_type, timestamp)
         VALUES ('1', 100, 'Old', 'Outros', 'receita', 'N/A', '2025-01-01T00:00:00.000Z')`,
      ).run();
      db.prepare(
        `INSERT INTO transactions (id, value, description, category, type, investment_type, timestamp)
         VALUES ('2', 200, 'In range', 'Outros', 'despesa', 'N/A', '2026-01-15T00:00:00.000Z')`,
      ).run();

      const result = await TransactionService.getTransactions(db, {
        start_date: '2026-01-01',
        end_date: '2026-01-31',
        type: 'despesa',
      });

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('In range');
    });

    it('returns empty array when no matches', async () => {
      const db = makeTestDb();
      const result = await TransactionService.getTransactions(db);
      expect(result).toEqual([]);
    });
  });

  describe('createTransaction', () => {
    it('enriches and persists a transaction', async () => {
      const db = makeTestDb();

      const result = await TransactionService.createTransaction(db, {
        value: 100,
        description: 'Aluguel #conjunto',
        type: 'despesa',
      });

      expect(result.category).toBe('Moradia');
      expect(result.investment_type).toBe('Conjunto');
      expect(result.id).toBeDefined();

      const stored = await TransactionService.getTransactions(db);
      expect(stored).toHaveLength(1);
    });
  });

  describe('getTransactionsPage', () => {
    it('paginates results and reports the total count', async () => {
      const db = makeTestDb();
      for (let i = 0; i < 3; i += 1) {
        await TransactionService.createTransaction(db, {
          value: 100,
          description: `Item ${i}`,
          type: 'despesa',
        });
      }

      const result = await TransactionService.getTransactionsPage(db, { page: 1, page_size: 2 });
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.page_size).toBe(2);
    });

    it('applies filters when paginating', async () => {
      const db = makeTestDb();
      await TransactionService.createTransaction(db, {
        value: 100,
        description: 'Mercado',
        type: 'despesa',
      });
      await TransactionService.createTransaction(db, {
        value: 200,
        description: 'Salário',
        type: 'receita',
      });

      const result = await TransactionService.getTransactionsPage(db, { type: 'receita' });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.items[0].description).toBe('Salário');
    });
  });

  describe('deleteTransaction', () => {
    it('deletes an existing transaction', async () => {
      const db = makeTestDb();
      const created = await TransactionService.createTransaction(db, {
        value: 100,
        description: 'x',
        type: 'despesa',
      });

      await expect(TransactionService.deleteTransaction(db, created.id)).resolves.toBeUndefined();
      expect(await TransactionService.getTransactions(db)).toEqual([]);
    });

    it('throws NotFoundError when transaction does not exist', async () => {
      const db = makeTestDb();

      await expect(TransactionService.deleteTransaction(db, 'missing')).rejects.toThrow(
        'Transaction not found',
      );
    });
  });
});
