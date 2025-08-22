import { useState, useEffect, useCallback } from 'react';
import { EnhancedSecurity } from '@/lib/enhanced-security';

interface UseSecureDataOptions {
  enabled?: boolean;
  refetchInterval?: number;
  onError?: (error: Error) => void;
}

export function useSecureProperties(
  limit: number = 50,
  options: UseSecureDataOptions = {}
) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const properties = await EnhancedSecurity.getPublicProperties(limit);
      setData(properties);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [limit, options]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [fetchData, options.enabled]);

  useEffect(() => {
    if (options.refetchInterval && options.enabled !== false) {
      const interval = setInterval(fetchData, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options.refetchInterval, options.enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

export function useSecureBrokerContact(brokerSlug: string | null) {
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchContactInfo = useCallback(async () => {
    if (!brokerSlug) return null;

    try {
      setLoading(true);
      setError(null);
      
      const contact = await EnhancedSecurity.getBrokerContactInfo(brokerSlug);
      setContactInfo(contact);
      return contact;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch contact info');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [brokerSlug]);

  return {
    contactInfo,
    loading,
    error,
    fetchContactInfo
  };
}

export function useSecurePropertySearch() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (
    searchTerm: string,
    filters: Record<string, any> = {},
    limit: number = 20
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const properties = await EnhancedSecurity.searchProperties(
        searchTerm,
        filters,
        limit
      );
      setResults(properties);
      return properties;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Search failed');
      setError(error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    search
  };
}