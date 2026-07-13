/**
 * @jest-environment node
 */
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { POST } from '../register/route';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

const mockCreateClient = createClient as jest.Mock;

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/register', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns 201 with a strong password', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        signUp: jest.fn().mockResolvedValue({
          data: { user: { id: 'u1', email: 'new@b.com' }, session: { access_token: 'tok' } },
          error: null,
        }),
      },
    });

    const response = await POST(makeRequest({ email: 'new@b.com', password: 'Password1' }));
    expect(response.status).toBe(201);
  });

  it('returns 400 for a weak password', async () => {
    mockCreateClient.mockResolvedValue({ auth: { signUp: jest.fn() } });

    const response = await POST(makeRequest({ email: 'new@b.com', password: 'weak' }));
    expect(response.status).toBe(400);
  });

  it('returns 409 for a duplicate email', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        signUp: jest.fn().mockResolvedValue({
          data: { user: null, session: null },
          error: { message: 'User already registered' },
        }),
      },
    });

    const response = await POST(makeRequest({ email: 'dup@b.com', password: 'Password1' }));
    expect(response.status).toBe(409);
  });
});
