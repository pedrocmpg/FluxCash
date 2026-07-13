/**
 * @jest-environment node
 */
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { GET, POST } from '../route';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

const mockCreateClient = createClient as jest.Mock;

function makeQueryBuilder(result: { data: any; error: any }) {
  const builder: any = {
    select: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    order: jest.fn(() => builder),
    limit: jest.fn(() => builder),
    gte: jest.fn(() => builder),
    lte: jest.fn(() => builder),
    insert: jest.fn(() => builder),
    single: jest.fn(() => Promise.resolve(result)),
    then: (resolve: any) => Promise.resolve(result).then(resolve),
  };
  return builder;
}

describe('GET /api/transactions', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    });

    const response = await GET(new NextRequest('http://localhost/api/transactions'));
    expect(response.status).toBe(401);
  });

  it('returns 200 with filtered transactions', async () => {
    const builder = makeQueryBuilder({ data: [{ id: '1' }], error: null });
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: jest.fn(() => builder),
    });

    const response = await GET(new NextRequest('http://localhost/api/transactions?type=despesa'));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual([{ id: '1' }]);
  });
});

describe('POST /api/transactions', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    });

    const request = new NextRequest('http://localhost/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ value: 100, description: 'x', type: 'receita' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('returns 201 for a valid payload', async () => {
    const builder = makeQueryBuilder({ data: { id: 'new' }, error: null });
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
      from: jest.fn(() => builder),
    });

    const request = new NextRequest('http://localhost/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ value: 100, description: 'Salário', type: 'receita' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it('returns 400 for a negative value', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
    });

    const request = new NextRequest('http://localhost/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ value: -100, description: 'x', type: 'receita' }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
