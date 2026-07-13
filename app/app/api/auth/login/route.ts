import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { LoginSchema } from '@/lib/validation/schemas';
import { AuthService } from '@/lib/services/authService';
import { createClient } from '@/lib/supabase/server';
import { RateLimiter } from '@/lib/utils/rateLimiter';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  try {
    if (!RateLimiter.checkLimit(`login:${ip}`)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { email, password } = LoginSchema.parse(body);

    const supabase = await createClient();
    const { user, token } = await AuthService.login(supabase, email, password);

    RateLimiter.reset(`login:${ip}`);

    return NextResponse.json(
      { data: { token, user: { id: user.id, email: user.email } } },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error('auth/login error:', error);
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
  }
}
