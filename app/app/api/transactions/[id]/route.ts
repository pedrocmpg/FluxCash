import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { UUIDSchema } from '@/lib/validation/schemas';
import { TransactionService } from '@/lib/services/transactionService';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const validId = UUIDSchema.parse(id);

    await TransactionService.deleteTransaction(supabase, user.id, validId);

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

    if (error instanceof Error && error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('DELETE /api/transactions/[id] error:', error);
    return NextResponse.json({ error: 'Erro no servidor. Tente novamente.' }, { status: 500 });
  }
}
