import { useState, useCallback } from 'react';
import { useUI } from './useUI';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = <T = any>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  const { showNotification } = useUI();

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    showSuccessMessage?: string,
    showErrorMessage: boolean = true
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      
      if (showSuccessMessage) {
        showNotification('success', showSuccessMessage);
      }
      
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Une erreur est survenue';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      
      if (showErrorMessage) {
        showNotification('error', errorMessage);
      }
      
      throw error;
    }
  }, [showNotification]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};