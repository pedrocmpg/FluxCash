import { NextRequest, NextResponse } from 'next/server';
import { SummaryService } from '@/lib/services/summaryService';
import { getDb } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start_date = searchParams.get('start_date') ?? undefined;
    const end_date = searchParams.get('end_date') ?? undefined;

    const summary = await SummaryService.getSummary(getDb(), { start_date, end_date });

    return NextResponse.json({ data: summary }, { status: 200 });
  } catch (error) {
    console.error('GET /api/summary error:', error);
    return NextResponse.json({ error: 'Erro no servidor. Tente novamente.' }, { status: 500 });
  }
}
