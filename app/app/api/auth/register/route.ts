import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { RegisterSchema } from '@/lib/validation/schemas';
import { AuthService } from '@/lib/services/authService';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = RegisterSchema.parse(body);

    const supabase = await createClient();
    const { user, token } = await AuthService.register(supabase, email, password);

    return NextResponse.json(
      { data: { token, user: { id: user.id, email: user.email } } },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (error instanceof Error && error.message === 'Email already registered') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error('auth/register error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro no servidor. Tente novamente.' },
      { status: 400 },
    );
  }
}
