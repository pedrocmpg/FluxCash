/**
 * @jest-environment node
 */
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { POST } from '../login/route';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

const mockCreateClient = createClient as jest.Mock;

function makeRequest(body: unknown, ip = '127.0.0.1') {
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/login', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns 200 with token on valid credentials', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: { id: 'u1', email: 'a@b.com' }, session: { access_token: 'tok' } },
          error: null,
        }),
      },
    });

    const response = await POST(
      makeRequest({ email: 'a@b.com', password: 'Password1' }, '10.0.0.1'),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.token).toBe('tok');
  });

  it('returns 400 for invalid credentials', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials' },
        }),
      },
    });

    const response = await POST(
      makeRequest({ email: 'a@b.com', password: 'wrongpass' }, '10.0.0.2'),
    );
    expect(response.status).toBe(400);
  });

  it('returns 400 for malformed payload', async () => {
    mockCreateClient.mockResolvedValue({ auth: { signInWithPassword: jest.fn() } });

    const response = await POST(
      makeRequest({ email: 'not-an-email', password: '123' }, '10.0.0.3'),
    );
    expect(response.status).toBe(400);
  });

  it('rate limits after 5 attempts from the same IP', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials' },
        }),
      },
    });

    const ip = '10.0.0.99';
    for (let i = 0; i < 5; i += 1) {
      await POST(makeRequest({ email: 'a@b.com', password: 'wrongpass' }, ip));
    }
    const response = await POST(makeRequest({ email: 'a@b.com', password: 'wrongpass' }, ip));
    expect(response.status).toBe(429);
  });
});
