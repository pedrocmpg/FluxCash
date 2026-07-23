import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { TransactionCreateSchema, TransactionFiltersSchema } from '@/lib/validation/schemas';
import { TransactionService } from '@/lib/services/transactionService';
import { getDb } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = TransactionFiltersSchema.parse({
      start_date: searchParams.get('start_date') ?? undefined,
      end_date: searchParams.get('end_date') ?? undefined,
      type: searchParams.get('type') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      page_size: searchParams.get('page_size') ?? undefined,
    });

    const page = await TransactionService.getTransactionsPage(getDb(), filters);

    return NextResponse.json({ data: page }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error('GET /api/transactions error:', error);
    return NextResponse.json({ error: 'Erro no servidor. Tente novamente.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = TransactionCreateSchema.parse(body);

    const transaction = await TransactionService.createTransaction(getDb(), payload);

    return NextResponse.json({ data: transaction }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error('POST /api/transactions error:', error);
    return NextResponse.json({ error: 'Erro no servidor. Tente novamente.' }, { status: 500 });
  }
}
