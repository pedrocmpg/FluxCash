/**
 * @jest-environment node
 */
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { POST } from '../logout/route';
import { createClient } from '@/lib/supabase/server';

const mockCreateClient = createClient as jest.Mock;

describe('POST /api/auth/logout', () => {
  it('returns 200 on success', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { signOut: jest.fn().mockResolvedValue({ error: null }) },
    });

    const response = await POST();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.message).toBe('Logged out successfully');
  });
});
