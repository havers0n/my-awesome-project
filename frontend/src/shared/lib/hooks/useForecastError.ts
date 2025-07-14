import { useState, useCallback } from "react";
import { MLError, MLErrorType, createMLError } from "@/shared/types/errors";

interface UseForecastErrorState {
  error: MLError | null;
  isLoading: boolean;
  retryCount: number;
}

interface UseForecastErrorReturn extends UseForecastErrorState {
  setError: (error: Error | MLError | null) => void;
  setLoading: (loading: boolean) => void;
  retry: (retryFn: () => Promise<any>) => Promise<void>;
  clearError: () => void;
  canRetry: boolean;
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS = [1000, 2000, 5000]; // Progressive delays in ms

export const useForecastError = (): UseForecastErrorReturn => {
  const [state, setState] = useState<UseForecastErrorState>({
    error: null,
    isLoading: false,
    retryCount: 0
  });

  const setError = useCallback((error: Error | MLError | null) => {
    if (!error) {
      setState(prev => ({ ...prev, error: null }));
      return;
    }

    // Convert regular Error to MLError if needed
    const mlError = (error as MLError).type 
      ? error as MLError 
      : createMLError('unknownError', error.message);

    setState(prev => ({ ...prev, error: mlError }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      error: null, 
      retryCount: 0 
    }));
  }, []);

  const retry = useCallback(async (retryFn: () => Promise<any>) => {
    const { retryCount, error } = state;

    // Check if we can retry
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      console.warn('Maximum retry attempts reached');
      return;
    }

    if (error && !error.retryable) {
      console.warn('Error is not retryable');
      return;
    }

    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        retryCount: prev.retryCount + 1
      }));

      // Add delay before retry (progressive backoff)
      if (retryCount > 0) {
        const delay = RETRY_DELAYS[Math.min(retryCount - 1, RETRY_DELAYS.length - 1)];
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      await retryFn();
      
      // Success - reset retry count
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        retryCount: 0 
      }));
    } catch (newError) {
      console.error('Retry failed:', newError);
      setError(newError as Error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state, setError]);

  const canRetry = state.error?.retryable === true && state.retryCount < MAX_RETRY_ATTEMPTS;

  return {
    ...state,
    setError,
    setLoading,
    retry,
    clearError,
    canRetry
  };
};
