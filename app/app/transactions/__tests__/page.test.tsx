import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/lib/test-utils/renderWithProviders';
import TransactionsPage from '../page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  usePathname: () => '/transactions',
}));

const transactionsResponse = {
  data: {
    items: [
      {
        id: '1',
        value: 500,
        description: 'Mercado',
        category: 'Alimentação',
        type: 'despesa',
        investment_type: 'N/A',
        timestamp: '2026-01-01T10:00:00Z',
      },
    ],
    total: 1,
    page: 1,
    page_size: 50,
  },
};

describe('TransactionsPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => transactionsResponse,
    }) as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the transaction table with fetched data', async () => {
    renderWithProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mercado')).toBeInTheDocument();
    });
  });

  it('refetches when filters change', async () => {
    renderWithProviders(<TransactionsPage />);

    await waitFor(() => expect(screen.getByText('Mercado')).toBeInTheDocument());

    const fetchCallsBefore = (global.fetch as jest.Mock).mock.calls.length;
    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-01-01' } });

    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(fetchCallsBefore);
    });
  });

  it('shows an error message when fetching fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Erro no servidor. Tente novamente.' }),
    }) as any;

    renderWithProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Erro no servidor. Tente novamente.')).toBeInTheDocument();
    });
  });
});
