import { parseStatementCsv } from '../statementParser';

const HEADER = 'Data;Descricao;CodTransacao;Identificador;Tipo;Valor;Saldo';

describe('parseStatementCsv', () => {
  it('parses debit and credit rows, stripping BOM and header', () => {
    const csv =
      '﻿' +
      HEADER +
      '\n' +
      '22/07/2026;PAGAMENTO PIX - 11222333000181 MERCADO DE ALIMENTOS GERE LTDA;664;E123;DEBITO;-R$ 11,70;R$ 155,51\n' +
      '21/07/2026;RECEBIMENTO PIX - 22233344455 66.777.888 FULANA DE TAL;668;E456;CREDITO;R$ 40,00;R$ 167,21';

    const result = parseStatementCsv(csv);

    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(2);

    expect(result.rows[0]).toMatchObject({
      timestamp: '2026-07-22T00:00:00',
      value: 11.7,
      type: 'despesa',
      externalId: 'E123',
      document: '11222333000181',
    });

    expect(result.rows[1]).toMatchObject({
      timestamp: '2026-07-21T00:00:00',
      value: 40,
      type: 'receita',
      externalId: 'E456',
      document: '22233344455',
    });
  });

  it('parses values with thousands separator', () => {
    const csv = `${HEADER}\n03/07/2026;TED SALARIO - 11122233396 FULANO DA SILVA;127;DG1;CREDITO;R$ 1.399,02;R$ 1.402,52`;

    const result = parseStatementCsv(csv);

    expect(result.rows[0].value).toBeCloseTo(1399.02);
  });

  it('returns null document when description has no CPF/CNPJ', () => {
    const csv = `${HEADER}\n13/07/2026;CARTAO DEBITO - ANTHROPIC* CLAUDE SUB - US;115;TRA-1;DEBITO;-R$ 110,00;R$ 68,81`;

    const result = parseStatementCsv(csv);

    expect(result.rows[0].document).toBeNull();
  });

  it('collects an error for malformed rows without dropping valid ones', () => {
    const csv = `${HEADER}\ninvalid-line\n22/07/2026;Compra;664;E1;DEBITO;-R$ 5,00;R$ 10,00`;

    const result = parseStatementCsv(csv);

    expect(result.errors).toHaveLength(1);
    expect(result.rows).toHaveLength(1);
  });

  it('returns an error for an empty file', () => {
    const result = parseStatementCsv('');
    expect(result.errors).toEqual(['Arquivo vazio.']);
    expect(result.rows).toEqual([]);
  });
});
