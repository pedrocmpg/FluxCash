export type TransactionType = 'receita' | 'despesa';

export type InvestmentType = 'Individual' | 'Conjunto' | 'N/A';

export type Category =
  | 'Alimentação'
  | 'Transporte'
  | 'Saúde'
  | 'Educação'
  | 'Lazer'
  | 'Moradia'
  | 'Investimento'
  | 'Receita'
  | 'Outros';

export const CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Saúde',
  'Educação',
  'Lazer',
  'Moradia',
  'Investimento',
  'Receita',
  'Outros',
] as const satisfies readonly Category[];

export interface Transaction {
  id: string;
  value: number;
  description: string;
  category: Category;
  type: TransactionType;
  investment_type: InvestmentType;
  timestamp: string;
  external_id: string | null;
}

export interface TransactionCreate {
  value: number;
  description: string;
  category?: Category;
  type: TransactionType;
  investment_type?: InvestmentType;
  external_id?: string | null;
  document?: string | null;
  timestamp?: string;
}
