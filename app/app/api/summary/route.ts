import { NextRequest, NextResponse } from 'next/server';
import { SummaryService } from '@/lib/services/summaryService';
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
    const start_date = searchParams.get('start_date') ?? undefined;
    const end_date = searchParams.get('end_date') ?? undefined;

    const summary = await SummaryService.getSummary(supabase, user.id, { start_date, end_date });

    return NextResponse.json({ data: summary }, { status: 200 });
  } catch (error) {
    console.error('GET /api/summary error:', error);
    return NextResponse.json({ error: 'Erro no servidor. Tente novamente.' }, { status: 500 });
  }
}
