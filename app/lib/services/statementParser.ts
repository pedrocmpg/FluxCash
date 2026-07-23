import { TransactionType } from '@/types/transaction';

export interface ParsedStatementRow {
  timestamp: string;
  description: string;
  value: number;
  type: TransactionType;
  externalId: string;
  document: string | null;
}

export interface StatementParseResult {
  rows: ParsedStatementRow[];
  errors: string[];
}

const HEADER = 'Data;Descricao;CodTransacao;Identificador;Tipo;Valor;Saldo';

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function parseDate(value: string): string | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}T00:00:00`;
}

function parseValor(value: string): number | null {
  const cleaned = value
    .trim()
    .replace(/^-?R\$\s*-?/, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

const DOCUMENT_REGEX = /\b(\d{11}|\d{14})\b/;

function extractDocument(description: string): string | null {
  const match = description.match(DOCUMENT_REGEX);
  return match ? match[1] : null;
}

export function parseStatementCsv(content: string): StatementParseResult {
  const rows: ParsedStatementRow[] = [];
  const errors: string[] = [];

  const lines = stripBom(content)
    .split(/\r\n|\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { rows, errors: ['Arquivo vazio.'] };
  }

  const startIndex = lines[0].startsWith(HEADER) ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(';');

    if (parts.length < 6) {
      errors.push(`Linha ${i + 1}: número de colunas inválido.`);
      continue;
    }

    const [dataRaw, descricaoRaw, , identificador, tipoRaw, valorRaw] = parts;

    const timestamp = parseDate(dataRaw);
    const value = parseValor(valorRaw);
    const description = descricaoRaw.trim();

    if (!timestamp || value === null || !description) {
      errors.push(`Linha ${i + 1}: dados inválidos.`);
      continue;
    }

    const type: TransactionType = tipoRaw.trim().toUpperCase() === 'CREDITO' ? 'receita' : 'despesa';

    rows.push({
      timestamp,
      description,
      value: Math.abs(value),
      type,
      externalId: identificador.trim(),
      document: extractDocument(description),
    });
  }

  return { rows, errors };
}
