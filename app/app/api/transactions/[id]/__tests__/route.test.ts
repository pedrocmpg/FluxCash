/**
 * @jest-environment node
 */
import { DatabaseSync } from 'node:sqlite';

jest.mock('@/lib/db/client', () => ({
  getDb: () => testDb,
}));

let testDb: DatabaseSync;

import { DELETE, PATCH } from '../route';
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

function makeRequest(id: string) {
  return {
    request: new NextRequest(`http://localhost/api/transactions/${id}`, { method: 'DELETE' }),
    params: Promise.resolve({ id }),
  };
}

function makePatchRequest(id: string, body: unknown) {
  return {
    request: new NextRequest(`http://localhost/api/transactions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    params: Promise.resolve({ id }),
  };
}

describe('DELETE /api/transactions/[id]', () => {
  it('returns 400 for an invalid UUID', async () => {
    const { request, params } = makeRequest('not-a-uuid');
    const response = await DELETE(request, { params });
    expect(response.status).toBe(400);
  });

  it('returns 404 when transaction does not exist', async () => {
    const { request, params } = makeRequest('123e4567-e89b-12d3-a456-426614174000');
    const response = await DELETE(request, { params });
    expect(response.status).toBe(404);
  });

  it('returns 200 when deletion succeeds', async () => {
    testDb
      .prepare(
        `INSERT INTO transactions (id, value, description, category, type, investment_type, timestamp)
         VALUES ('123e4567-e89b-12d3-a456-426614174000', 100, 'Mercado', 'Alimentação', 'despesa', 'N/A', '2026-01-01T10:00:00.000Z')`,
      )
      .run();

    const { request, params } = makeRequest('123e4567-e89b-12d3-a456-426614174000');
    const response = await DELETE(request, { params });
    expect(response.status).toBe(200);
  });
});

describe('PATCH /api/transactions/[id]', () => {
  const validPayload = {
    value: 150,
    description: 'Mercado atualizado',
    category: 'Alimentação',
    type: 'despesa',
    investment_type: 'N/A',
  };

  it('returns 400 for an invalid UUID', async () => {
    const { request, params } = makePatchRequest('not-a-uuid', validPayload);
    const response = await PATCH(request, { params });
    expect(response.status).toBe(400);
  });

  it('returns 400 for an invalid payload', async () => {
    const { request, params } = makePatchRequest('123e4567-e89b-12d3-a456-426614174000', {
      value: -10,
      description: '',
      type: 'despesa',
    });
    const response = await PATCH(request, { params });
    expect(response.status).toBe(400);
  });

  it('returns 404 when transaction does not exist', async () => {
    const { request, params } = makePatchRequest(
      '123e4567-e89b-12d3-a456-426614174000',
      validPayload,
    );
    const response = await PATCH(request, { params });
    expect(response.status).toBe(404);
  });

  it('returns 200 with the updated transaction when it succeeds', async () => {
    testDb
      .prepare(
        `INSERT INTO transactions (id, value, description, category, type, investment_type, timestamp)
         VALUES ('123e4567-e89b-12d3-a456-426614174000', 100, 'Mercado', 'Alimentação', 'despesa', 'N/A', '2026-01-01T10:00:00.000Z')`,
      )
      .run();

    const { request, params } = makePatchRequest(
      '123e4567-e89b-12d3-a456-426614174000',
      validPayload,
    );
    const response = await PATCH(request, { params });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.description).toBe('Mercado atualizado');
    expect(body.data.value).toBe(150);
  });
});
