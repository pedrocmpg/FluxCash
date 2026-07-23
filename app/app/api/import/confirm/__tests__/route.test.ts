/**
 * @jest-environment node
 */
import { DatabaseSync } from 'node:sqlite';

jest.mock('@/lib/db/client', () => ({
  getDb: () => testDb,
}));

let testDb: DatabaseSync;

import { POST } from '../route';
import { NextRequest } from 'next/server';

beforeEach(() => {
  testDb = new DatabaseSync(':memory:');
  testDb.exec(`
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
  testDb.exec(`
    CREATE UNIQUE INDEX idx_transactions_external_id
      ON transactions(external_id) WHERE external_id IS NOT NULL
  `);
  testDb.exec(`
    CREATE TABLE merchant_rules (
      document TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
});

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/import/confirm', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const validRow = {
  externalId: 'E1',
  timestamp: '2026-07-22T00:00:00',
  description: 'Compra no supermercado',
  value: 11.7,
  type: 'despesa',
  document: null,
  category: 'Alimentação',
};

describe('POST /api/import/confirm', () => {
  it('imports valid rows', async () => {
    const response = await POST(makeRequest({ rows: [validRow] }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.imported).toHaveLength(1);
    expect(json.data.skipped).toEqual([]);
  });

  it('skips rows already imported by external id', async () => {
    await POST(makeRequest({ rows: [validRow] }));
    const response = await POST(makeRequest({ rows: [validRow] }));
    const json = await response.json();

    expect(json.data.imported).toEqual([]);
    expect(json.data.skipped).toEqual(['E1']);
  });

  it('returns 400 when rows is empty', async () => {
    const response = await POST(makeRequest({ rows: [] }));
    expect(response.status).toBe(400);
  });

  it('returns 400 when a row has an invalid category', async () => {
    const response = await POST(makeRequest({ rows: [{ ...validRow, category: 'Invalida' }] }));
    expect(response.status).toBe(400);
  });
});
