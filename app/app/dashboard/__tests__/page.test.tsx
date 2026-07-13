import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/lib/test-utils/renderWithProviders';
import DashboardPage from '../page';

jest.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => ({
    user: { id: 'u1', email: 'test@example.com' },
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  usePathname: () => '/dashboard',
}));

const summaryResponse = {
  data: {
    total_income: 1000,
    total_expense: 400,
    balance: 600,
    total_investment: 200,
    expense_by_category: {},
    income_by_category: {},
  },
};

const transactionsResponse = {
  data: [
    {
      id: '1',
      value: 1000,
      description: 'Salário',
      category: 'Receita',
      type: 'receita',
      investment_type: 'N/A',
      timestamp: '2026-01-01T10:00:00Z',
      user_id: 'u1',
    },
  ],
};

describe('DashboardPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn((url: string) => {
      if (url.toString().includes('/api/summary')) {
        return Promise.resolve({ ok: true, json: async () => summaryResponse } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => transactionsResponse } as Response);
    }) as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches and renders summary and transactions', async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Total Receitas/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/R\$\s*1\.000,00/)).toBeInTheDocument();
  });

  it('shows an error message when fetching fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Erro no servidor. Tente novamente.' }),
    }) as any;

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Erro no servidor. Tente novamente.')).toBeInTheDocument();
    });
  });
});
