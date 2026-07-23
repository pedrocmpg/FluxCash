import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { CATEGORIES } from '@/types/transaction';
import { StatementImportService } from '@/lib/services/statementImportService';
import { getDb } from '@/lib/db/client';

const ImportRowSchema = z.object({
  externalId: z.string().min(1),
  timestamp: z.string().min(1),
  description: z.string().min(1).max(200),
  value: z.number().positive(),
  type: z.enum(['receita', 'despesa']),
  document: z.string().nullable(),
  category: z.enum(CATEGORIES),
});

const ConfirmSchema = z.object({
  rows: z.array(ImportRowSchema).min(1, 'Nenhuma transação para importar.'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rows } = ConfirmSchema.parse(body);

    const result = await StatementImportService.confirm(getDb(), rows);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error('POST /api/import/confirm error:', error);
    return NextResponse.json({ error: 'Erro no servidor. Tente novamente.' }, { status: 500 });
  }
}
