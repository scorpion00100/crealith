import { useState, useCallback, useRef, useEffect } from 'react';
import { useErrorHandler, ErrorType } from './useErrorHandler';

/**
 * État d'une opération asynchrone
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: any | null;
  success: boolean;
}

/**
 * Options pour les opérations asynchrones
 */
export interface AsyncOptions {
  immediate?: boolean;
  retryable?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onFinally?: () => void;
}

/**
 * Hook pour gérer les opérations asynchrones avec gestion d'erreurs
 */
export const useAsyncError = <T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: AsyncOptions = {}
) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const { handleError, handleErrorWithRetry } = useErrorHandler();
  const isMountedRef = useRef(true);
  const operationIdRef = useRef<string>('');

  // Nettoyer la référence au démontage
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Exécute l'opération asynchrone
   */
  const execute = useCallback(async (...args: any[]) => {
    if (!isMountedRef.current) return;

    const operationId = `async_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    operationIdRef.current = operationId;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }));

    try {
      let result: T;

      if (options.retryable) {
        result = await handleErrorWithRetry(
          () => asyncFunction(...args),
          {
            retryable: true,
            maxRetries: options.maxRetries,
            retryDelay: options.retryDelay,
            showToast: false, // On gère l'affichage manuellement
          },
          operationId
        );
      } else {
        result = await asyncFunction(...args);
      }

      if (!isMountedRef.current) return;

      setState({
        data: result,
        loading: false,
        error: null,
        success: true,
      });

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (error) {
      if (!isMountedRef.current) return;

      const errorInfo = handleError(error, {
        showToast: false, // On gère l'affichage manuellement
      });

      setState({
        data: null,
        loading: false,
        error: errorInfo,
        success: false,
      });

      if (options.onError) {
        options.onError(errorInfo);
      }

      throw errorInfo;
    } finally {
      if (!isMountedRef.current) return;

      if (options.onFinally) {
        options.onFinally();
      }
    }
  }, [asyncFunction, options, handleError, handleErrorWithRetry]);

  /**
   * Réinitialise l'état
   */
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  /**
   * Retry la dernière opération
   */
  const retry = useCallback(async (...args: any[]) => {
    return execute(...args);
  }, [execute]);

  return {
    ...state,
    execute,
    reset,
    retry,
    isIdle: !state.loading && !state.error && !state.success,
  };
};

/**
 * Hook spécialisé pour les requêtes API
 */
export const useApiError = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: AsyncOptions = {}
) => {
  const asyncHook = useAsyncError(apiFunction, {
    retryable: true,
    maxRetries: 3,
    retryDelay: 1000,
    ...options,
  });

  return asyncHook;
};

/**
 * Hook pour gérer les erreurs de formulaire
 */
export const useFormError = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { handleError } = useErrorHandler();

  /**
   * Définit une erreur pour un champ
   */
  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  /**
   * Définit plusieurs erreurs
   */
  const setErrors = useCallback((newErrors: Record<string, string>) => {
    setErrors(newErrors);
  }, []);

  /**
   * Efface l'erreur d'un champ
   */
  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Efface toutes les erreurs
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Gère une erreur de validation
   */
  const handleValidationError = useCallback((error: any) => {
    const errorInfo = handleError(error, {
      showToast: false,
    });

    if (errorInfo.type === ErrorType.VALIDATION && errorInfo.details?.errors) {
      setErrors(errorInfo.details.errors);
    } else {
      // Erreur générale
      setFieldError('general', errorInfo.message);
    }

    return errorInfo;
  }, [handleError, setFieldError]);

  /**
   * Vérifie s'il y a des erreurs
   */
  const hasErrors = Object.keys(errors).length > 0;

  /**
   * Obtient l'erreur d'un champ
   */
  const getFieldError = useCallback((field: string): string | undefined => {
    return errors[field];
  }, [errors]);

  return {
    errors,
    hasErrors,
    setFieldError,
    setErrors,
    clearFieldError,
    clearAllErrors,
    handleValidationError,
    getFieldError,
  };
};

/**
 * Hook pour gérer les erreurs de chargement de données
 */
export const useDataError = <T = any>(
  dataLoader: () => Promise<T>,
  options: AsyncOptions = {}
) => {
  const asyncHook = useAsyncError(dataLoader, {
    immediate: true,
    retryable: true,
    maxRetries: 3,
    retryDelay: 2000,
    ...options,
  });

  return asyncHook;
};
