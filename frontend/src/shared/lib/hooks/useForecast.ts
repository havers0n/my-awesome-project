import { useState, useCallback } from "react";
import { fetchForecastData, postForecast, fetchForecastHistory } from "../api/forecast";
import { ForecastApiResponse } from "../pages/types";
import { useForecastError } from "./useForecastError";
import { getErrorFromAxiosError } from "@/shared/types/errors";

interface UseForecastState {
  data: ForecastApiResponse | null;
  historyData: { items: any[]; total: number } | null;
}

interface UseForecastReturn extends UseForecastState {
  isLoading: boolean;
  error: any;
  retryCount: number;
  canRetry: boolean;
  fetchData: (days: number) => Promise<void>;
  generateForecast: () => Promise<void>;
  fetchHistory: (page: number, limit: number, search?: string, category?: string) => Promise<void>;
  retry: () => Promise<void>;
  clearError: () => void;
}

export const useForecast = (): UseForecastReturn => {
  const [state, setState] = useState<UseForecastState>({
    data: null,
    historyData: null
  });

  const {
    error,
    isLoading,
    retryCount,
    canRetry,
    setError,
    setLoading,
    retry,
    clearError
  } = useForecastError();

  // Store the last operation for retry functionality
  const [lastOperation, setLastOperation] = useState<{
    type: 'fetch' | 'generate' | 'history';
    params?: any;
  } | null>(null);

  const fetchData = useCallback(async (days: number) => {
    setLastOperation({ type: 'fetch', params: { days } });
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchForecastData(days);
      setState(prev => ({ ...prev, data: result }));
    } catch (err) {
      const mlError = getErrorFromAxiosError(err);
      setError(mlError);
      throw mlError;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  const generateForecast = useCallback(async () => {
    setLastOperation({ type: 'generate' });
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await postForecast();
      setState(prev => ({ ...prev, data: result }));
    } catch (err) {
      const mlError = getErrorFromAxiosError(err);
      setError(mlError);
      throw mlError;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  const fetchHistory = useCallback(async (
    page: number, 
    limit: number, 
    search?: string, 
    category?: string
  ) => {
    setLastOperation({ 
      type: 'history', 
      params: { page, limit, search, category } 
    });
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchForecastHistory(page, limit, search || '', category || '');
      setState(prev => ({ ...prev, historyData: result }));
    } catch (err) {
      const mlError = getErrorFromAxiosError(err);
      setError(mlError);
      throw mlError;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading]);

  const retryLastOperation = useCallback(async () => {
    if (!lastOperation) return;

    const retryFn = async () => {
      switch (lastOperation.type) {
        case 'fetch':
          await fetchData(lastOperation.params.days);
          break;
        case 'generate':
          await generateForecast();
          break;
        case 'history':
          const { page, limit, search, category } = lastOperation.params;
          await fetchHistory(page, limit, search, category);
          break;
      }
    };

    await retry(retryFn);
  }, [lastOperation, fetchData, generateForecast, fetchHistory, retry]);

  return {
    ...state,
    isLoading,
    error,
    retryCount,
    canRetry,
    fetchData,
    generateForecast,
    fetchHistory,
    retry: retryLastOperation,
    clearError
  };
};
