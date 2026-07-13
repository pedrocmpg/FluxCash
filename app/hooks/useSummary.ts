'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardSummary } from '@/types/summary';

interface SummaryFilters {
  start_date?: string;
  end_date?: string;
}

async function fetchSummary(filters?: SummaryFilters): Promise<DashboardSummary> {
  const params = new URLSearchParams();
  if (filters?.start_date) params.set('start_date', filters.start_date);
  if (filters?.end_date) params.set('end_date', filters.end_date);

  const response = await fetch(`/api/summary?${params.toString()}`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to load summary');
  return result.data;
}

export function useSummary(filters?: SummaryFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['summary', filters],
    queryFn: () => fetchSummary(filters),
  });

  return { summary: data, isLoading, error: error as Error | null };
}
