import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { TransactionCreateSchema, TransactionFiltersSchema } from '@/lib/validation/schemas';
import { TransactionService } from '@/lib/services/transactionService';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = TransactionFiltersSchema.parse({
      start_date: searchParams.get('start_date') ?? undefined,
      end_date: searchParams.get('end_date') ?? undefined,
      type: searchParams.get('type') ?? undefined,
      category: searchParams.get('category') ?? undefined,
    });

    const transactions = await TransactionService.getTransactions(supabase, user.id, filters);

    return NextResponse.json({ data: transactions }, { status: 200 });
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const payload = TransactionCreateSchema.parse(body);

    const transaction = await TransactionService.createTransaction(supabase, user.id, payload);

    return NextResponse.json({ data: transaction }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error('POST /api/transactions error:', error);
    return NextResponse.json({ error: 'Erro no servidor. Tente novamente.' }, { status: 500 });
  }
}
