import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

interface OptimizedQueryOptions<TData> extends Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'> {
  queryKey: (string | number | boolean | null | undefined)[];
  queryFn: () => Promise<TData>;
  persistData?: boolean;
}

export function useOptimizedQuery<TData = unknown>(
  options: OptimizedQueryOptions<TData>
): UseQueryResult<TData> {
  const { persistData = true, ...queryOptions } = options;

  return useQuery({
    ...queryOptions,
    staleTime: persistData ? 5 * 60 * 1000 : 0, // 5 minutes for persistent data
    gcTime: persistData ? 10 * 60 * 1000 : 5 * 60 * 1000, // 10 minutes for persistent, 5 minutes for others
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      // Don't retry on 404s or auth errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status === 404 || status === 401 || status === 403) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}