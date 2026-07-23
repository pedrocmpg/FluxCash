import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'fluxcash.db');

let db: DatabaseSync | undefined;

export function getDb(): DatabaseSync {
  if (db) return db;

  mkdirSync(DB_DIR, { recursive: true });
  db = new DatabaseSync(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
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

  const columns = db.prepare(`PRAGMA table_info(transactions)`).all() as unknown as {
    name: string;
  }[];
  if (!columns.some((column) => column.name === 'external_id')) {
    db.exec(`ALTER TABLE transactions ADD COLUMN external_id TEXT`);
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_external_id
      ON transactions(external_id) WHERE external_id IS NOT NULL
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS merchant_rules (
      document TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  return db;
}
