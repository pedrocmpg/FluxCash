import { z } from 'zod';
import { CATEGORIES } from '@/types/transaction';

export const TransactionCreateSchema = z.object({
  value: z.number().positive('Value must be greater than zero'),
  description: z.string().min(1).max(200, 'Description must be 1-200 characters'),
  category: z.enum(CATEGORIES).optional(),
  type: z.enum(['receita', 'despesa']),
  investment_type: z.enum(['Individual', 'Conjunto', 'N/A']).optional(),
});

export const TransactionUpdateSchema = TransactionCreateSchema;

export const TransactionFiltersSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  type: z.enum(['receita', 'despesa']).optional(),
  category: z.enum(CATEGORIES).optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().optional(),
  page_size: z.coerce.number().int().positive().max(200).optional(),
});

export const UUIDSchema = z.string().uuid('Invalid UUID format');
