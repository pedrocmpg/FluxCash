/**
 * @jest-environment node
 */
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { DELETE } from '../route';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

const mockCreateClient = createClient as jest.Mock;

function makeQueryBuilder(result: { data: any; error: any }) {
  const builder: any = {
    select: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    delete: jest.fn(() => builder),
    maybeSingle: jest.fn(() => Promise.resolve(result)),
    then: (resolve: any) => Promise.resolve(result).then(resolve),
  };
  return builder;
}

function makeRequest(id: string) {
  return {
    request: new NextRequest(`http://localhost/api/transactions/${id}`, { method: 'DELETE' }),
    params: Promise.resolve({ id }),
  };
}

describe('DELETE /api/transactions/[id]', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns 400 for an invalid UUID', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
    });

    const { request, params } = makeRequest('not-a-uuid');
    const response = await DELETE(request, { params });
    expect(response.status).toBe(400);
  });

  it('returns 401 when unauthenticated', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    });

    const { request, params } = makeRequest('123e4567-e89b-12d3-a456-426614174000');
    const response = await DELETE(request, { params });
    expect(response.status).toBe(401);
  });

  it('returns 404 when transaction does not exist', async () => {
    const builder = makeQueryBuilder({ data: null, error: null });
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: jest.fn(() => builder),
    });

    const { request, params } = makeRequest('123e4567-e89b-12d3-a456-426614174000');
    const response = await DELETE(request, { params });
    expect(response.status).toBe(404);
  });

  it('returns 403 when transaction belongs to another user', async () => {
    const builder = makeQueryBuilder({ data: { id: 't1', user_id: 'other' }, error: null });
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: jest.fn(() => builder),
    });

    const { request, params } = makeRequest('123e4567-e89b-12d3-a456-426614174000');
    const response = await DELETE(request, { params });
    expect(response.status).toBe(403);
  });

  it('returns 200 when deletion succeeds', async () => {
    const builder = makeQueryBuilder({ data: { id: 't1', user_id: 'u1' }, error: null });
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: jest.fn(() => builder),
    });

    const { request, params } = makeRequest('123e4567-e89b-12d3-a456-426614174000');
    const response = await DELETE(request, { params });
    expect(response.status).toBe(200);
  });
});
