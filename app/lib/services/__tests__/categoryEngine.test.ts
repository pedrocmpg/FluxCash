import { DatabaseSync } from 'node:sqlite';
import { CategoryEngine } from '../categoryEngine';
import { MerchantRuleService } from '../merchantRuleService';

function makeTestDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE merchant_rules (
      document TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  return db;
}

describe('CategoryEngine', () => {
  describe('suggestCategory', () => {
    it('categorizes "supermercado" as Alimentação', () => {
      expect(CategoryEngine.suggestCategory('Compra no supermercado')).toBe('Alimentação');
    });

    it('categorizes "uber" as Transporte', () => {
      expect(CategoryEngine.suggestCategory('Corrida de Uber')).toBe('Transporte');
    });

    it('categorizes "netflix" as Lazer', () => {
      expect(CategoryEngine.suggestCategory('Assinatura Netflix')).toBe('Lazer');
    });

    it('categorizes "salario" as Receita', () => {
      expect(CategoryEngine.suggestCategory('Pagamento de salario')).toBe('Receita');
    });

    it('returns Outros for unmatched keywords', () => {
      expect(CategoryEngine.suggestCategory('Random description')).toBe('Outros');
    });

    it('handles accents correctly', () => {
      expect(CategoryEngine.suggestCategory('Compra no açougue')).toBe('Alimentação');
      expect(CategoryEngine.suggestCategory('Consulta com médico')).toBe('Saúde');
    });

    it('does not match short keywords as a substring inside numbers', () => {
      expect(
        CategoryEngine.suggestCategory('TED SALARIO - 11122233396 FULANO DA SILVA'),
      ).toBe('Receita');
    });

    it('matches short keywords when they appear as a standalone word', () => {
      expect(CategoryEngine.suggestCategory('Corrida de 99')).toBe('Transporte');
    });

    it('does not match "gas" as a substring inside an unrelated word', () => {
      expect(CategoryEngine.suggestCategory('Fulano da Silva')).toBe('Outros');
    });
  });

  describe('isJointTransaction', () => {
    it('detects #conjunto tag', () => {
      expect(CategoryEngine.isJointTransaction('Compra no mercado #conjunto')).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(CategoryEngine.isJointTransaction('Aluguel #CONJUNTO')).toBe(true);
    });

    it('returns false when tag is absent', () => {
      expect(CategoryEngine.isJointTransaction('Compra pessoal')).toBe(false);
    });
  });

  describe('detectInvestmentType', () => {
    it('returns Conjunto when #conjunto tag is present', () => {
      expect(CategoryEngine.detectInvestmentType('Aporte #conjunto')).toBe('Conjunto');
    });

    it('returns N/A when tag is absent', () => {
      expect(CategoryEngine.detectInvestmentType('Aporte individual')).toBe('N/A');
    });
  });

  describe('processTransaction', () => {
    it('enriches with suggested category and detected investment type', () => {
      const result = CategoryEngine.processTransaction({
        value: 100,
        description: 'Aluguel #conjunto',
        type: 'despesa',
      });

      expect(result.category).toBe('Moradia');
      expect(result.investment_type).toBe('Conjunto');
    });

    it('preserves manually chosen category', () => {
      const result = CategoryEngine.processTransaction({
        value: 50,
        description: 'Compra qualquer',
        category: 'Lazer',
        type: 'despesa',
      });

      expect(result.category).toBe('Lazer');
    });

    it('defaults investment_type to N/A without #conjunto', () => {
      const result = CategoryEngine.processTransaction({
        value: 50,
        description: 'Compra qualquer',
        type: 'despesa',
      });

      expect(result.investment_type).toBe('N/A');
    });

    it('uses a saved merchant rule over keyword matching when a db and document are given', () => {
      const db = makeTestDb();
      MerchantRuleService.setCategory(db, '11222333000181', 'Alimentação');

      const result = CategoryEngine.processTransaction(
        {
          value: 10,
          description: 'PAGAMENTO PIX - 11222333000181 MERCADO DE ALIMENTOS',
          type: 'despesa',
          document: '11222333000181',
        },
        db,
      );

      expect(result.category).toBe('Alimentação');
    });

    it('falls back to keyword matching when no rule exists for the document', () => {
      const db = makeTestDb();

      const result = CategoryEngine.processTransaction(
        {
          value: 10,
          description: 'Compra no supermercado',
          type: 'despesa',
          document: '12345678900',
        },
        db,
      );

      expect(result.category).toBe('Alimentação');
    });
  });
});
