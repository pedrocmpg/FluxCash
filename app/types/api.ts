import { Category, TransactionType } from './transaction';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface TransactionFilters {
  start_date?: string;
  end_date?: string;
  type?: TransactionType;
  category?: Category;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedTransactions {
  items: import('./transaction').Transaction[];
  total: number;
  page: number;
  page_size: number;
}
