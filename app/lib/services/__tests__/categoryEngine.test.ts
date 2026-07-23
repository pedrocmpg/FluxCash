import { CategoryEngine } from '../categoryEngine';

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
  });
});
