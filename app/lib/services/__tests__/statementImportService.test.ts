import { DatabaseSync } from 'node:sqlite';
import { StatementImportService } from '../statementImportService';
import { MerchantRuleService } from '../merchantRuleService';

const HEADER = 'Data;Descricao;CodTransacao;Identificador;Tipo;Valor;Saldo';

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
    CREATE UNIQUE INDEX idx_transactions_external_id
      ON transactions(external_id) WHERE external_id IS NOT NULL
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

describe('StatementImportService', () => {
  describe('preview', () => {
    it('suggests category from a merchant rule over keyword matching', () => {
      const db = makeTestDb();
      MerchantRuleService.setCategory(db, '11222333000181', 'Alimentação');

      const csv = `${HEADER}\n22/07/2026;PAGAMENTO PIX - 11222333000181 MERCADO DE ALIMENTOS GERE LTDA;664;E1;DEBITO;-R$ 11,70;R$ 155,51`;

      const result = StatementImportService.preview(db, csv);

      expect(result.rows[0].category).toBe('Alimentação');
      expect(result.rows[0].categorySource).toBe('rule');
    });

    it('falls back to keyword matching when there is no rule', () => {
      const db = makeTestDb();
      const csv = `${HEADER}\n22/07/2026;Compra no supermercado;664;E1;DEBITO;-R$ 11,70;R$ 155,51`;

      const result = StatementImportService.preview(db, csv);

      expect(result.rows[0].category).toBe('Alimentação');
      expect(result.rows[0].categorySource).toBe('keyword');
    });

    it('marks rows with no rule or keyword match as none/Outros', () => {
      const db = makeTestDb();
      const csv = `${HEADER}\n13/07/2026;TRANSFERENCIA 99888777000166 EMPRESA FICTICIA;664;E1;DEBITO;-R$ 100,00;R$ 139,67`;

      const result = StatementImportService.preview(db, csv);

      expect(result.rows[0].category).toBe('Outros');
      expect(result.rows[0].categorySource).toBe('none');
    });

    it('flags rows whose external id already exists as duplicate', async () => {
      const db = makeTestDb();
      await StatementImportService.confirm(db, [
        {
          externalId: 'E1',
          timestamp: '2026-07-22T00:00:00',
          description: 'Compra no supermercado',
          value: 11.7,
          type: 'despesa',
          document: null,
          category: 'Alimentação',
        },
      ]);

      const csv = `${HEADER}\n22/07/2026;Compra no supermercado;664;E1;DEBITO;-R$ 11,70;R$ 155,51`;
      const result = StatementImportService.preview(db, csv);

      expect(result.rows[0].duplicate).toBe(true);
    });
  });

  describe('confirm', () => {
    it('imports new rows and returns them', async () => {
      const db = makeTestDb();

      const result = await StatementImportService.confirm(db, [
        {
          externalId: 'E1',
          timestamp: '2026-07-22T00:00:00',
          description: 'Compra no supermercado',
          value: 11.7,
          type: 'despesa',
          document: null,
          category: 'Alimentação',
        },
      ]);

      expect(result.imported).toHaveLength(1);
      expect(result.skipped).toEqual([]);
      expect(result.imported[0].timestamp).toBe('2026-07-22T00:00:00');
    });

    it('skips rows whose external id was already imported', async () => {
      const db = makeTestDb();
      const row = {
        externalId: 'E1',
        timestamp: '2026-07-22T00:00:00',
        description: 'Compra no supermercado',
        value: 11.7,
        type: 'despesa' as const,
        document: null,
        category: 'Alimentação' as const,
      };

      await StatementImportService.confirm(db, [row]);
      const second = await StatementImportService.confirm(db, [row]);

      expect(second.imported).toEqual([]);
      expect(second.skipped).toEqual(['E1']);
    });

    it('saves a merchant rule when a document and non-Outros category are provided', async () => {
      const db = makeTestDb();

      await StatementImportService.confirm(db, [
        {
          externalId: 'E1',
          timestamp: '2026-07-22T00:00:00',
          description: 'PAGAMENTO PIX - 11222333000181 MERCADO',
          value: 11.7,
          type: 'despesa',
          document: '11222333000181',
          category: 'Alimentação',
        },
      ]);

      expect(MerchantRuleService.getCategory(db, '11222333000181')).toBe('Alimentação');
    });
  });
});
