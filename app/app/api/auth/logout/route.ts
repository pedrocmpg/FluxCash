import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    await AuthService.logout(supabase);

    return NextResponse.json({ data: { message: 'Logged out successfully' } }, { status: 200 });
  } catch (error) {
    console.error('auth/logout error:', error);
    return NextResponse.json({ error: 'Erro no servidor. Tente novamente.' }, { status: 500 });
  }
}
