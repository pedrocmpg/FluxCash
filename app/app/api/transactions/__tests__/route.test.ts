/**
 * @jest-environment node
 */
import { DatabaseSync } from 'node:sqlite';

jest.mock('@/lib/db/client', () => ({
  getDb: () => testDb,
}));

let testDb: DatabaseSync;

import { GET, POST } from '../route';
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
      timestamp TEXT NOT NULL
    )
  `);
});

describe('GET /api/transactions', () => {
  it('returns 200 with an empty list when there are no transactions', async () => {
    const response = await GET(new NextRequest('http://localhost/api/transactions'));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual([]);
  });

  it('returns 200 with filtered transactions', async () => {
    testDb
      .prepare(
        `INSERT INTO transactions (id, value, description, category, type, investment_type, timestamp)
         VALUES ('1', 100, 'Mercado', 'Alimentação', 'despesa', 'N/A', '2026-01-01T10:00:00.000Z')`,
      )
      .run();

    const response = await GET(new NextRequest('http://localhost/api/transactions?type=despesa'));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].description).toBe('Mercado');
  });
});

describe('POST /api/transactions', () => {
  it('returns 201 for a valid payload', async () => {
    const request = new NextRequest('http://localhost/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ value: 100, description: 'Salário', type: 'receita' }),
    });
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.data.id).toBeDefined();
  });

  it('returns 400 for a negative value', async () => {
    const request = new NextRequest('http://localhost/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ value: -100, description: 'x', type: 'receita' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
