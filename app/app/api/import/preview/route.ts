import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ZodError } from 'zod';
import { StatementImportService } from '@/lib/services/statementImportService';
import { getDb } from '@/lib/db/client';

const PreviewSchema = z.object({
  csv: z.string().min(1, 'Arquivo CSV vazio.'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { csv } = PreviewSchema.parse(body);

    const result = StatementImportService.preview(getDb(), csv);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error('POST /api/import/preview error:', error);
    return NextResponse.json({ error: 'Erro no servidor. Tente novamente.' }, { status: 500 });
  }
}
