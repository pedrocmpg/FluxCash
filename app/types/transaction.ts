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
  user_id: string;
}

export interface TransactionCreate {
  value: number;
  description: string;
  category?: Category;
  type: TransactionType;
  investment_type?: InvestmentType;
}
