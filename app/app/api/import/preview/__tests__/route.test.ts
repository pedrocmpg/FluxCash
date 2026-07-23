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

const HEADER = 'Data;Descricao;CodTransacao;Identificador;Tipo;Valor;Saldo';

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

function makeRequest(csv: string) {
  return new NextRequest('http://localhost/api/import/preview', {
    method: 'POST',
    body: JSON.stringify({ csv }),
  });
}

describe('POST /api/import/preview', () => {
  it('returns parsed rows with suggested categories', async () => {
    const csv = `${HEADER}\n22/07/2026;Compra no supermercado;664;E1;DEBITO;-R$ 11,70;R$ 155,51`;

    const response = await POST(makeRequest(csv));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.rows).toHaveLength(1);
    expect(json.data.rows[0].category).toBe('Alimentação');
  });

  it('returns 400 when csv field is missing', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/import/preview', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
  });
});
