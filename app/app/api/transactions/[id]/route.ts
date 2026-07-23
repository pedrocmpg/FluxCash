import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { UUIDSchema, TransactionUpdateSchema } from '@/lib/validation/schemas';
import { TransactionService } from '@/lib/services/transactionService';
import { getDb } from '@/lib/db/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const validId = UUIDSchema.parse(id);
    const body = await request.json();
    const payload = TransactionUpdateSchema.parse(body);

    const transaction = await TransactionService.updateTransaction(getDb(), validId, payload);

    return NextResponse.json({ data: transaction }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (error instanceof Error && error.name === 'NotFoundError') {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    console.error('PATCH /api/transactions/[id] error:', error);
    return NextResponse.json({ error: 'Erro no servidor. Tente novamente.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const validId = UUIDSchema.parse(id);

    await TransactionService.deleteTransaction(getDb(), validId);

    return NextResponse.json(
      { data: { message: 'Transaction deleted successfully' } },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid transaction ID format' }, { status: 400 });
    }

    if (error instanceof Error && error.name === 'NotFoundError') {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    console.error('DELETE /api/transactions/[id] error:', error);
    return NextResponse.json({ error: 'Erro no servidor. Tente novamente.' }, { status: 500 });
  }
}
