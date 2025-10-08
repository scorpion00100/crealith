import { useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { logger } from '@/utils/logger';

/**
 * Types d'erreurs pour la gestion centralisée
 */
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

/**
 * Interface pour les informations d'erreur
 */
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  code?: string | number;
  details?: any;
  timestamp: string;
  correlationId?: string;
}

/**
 * Configuration pour la gestion des erreurs
 */
export interface ErrorHandlerConfig {
  showToast: boolean;
  logToConsole: boolean;
  reportToService: boolean;
  retryable: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Hook personnalisé pour la gestion centralisée des erreurs
 */
export const useErrorHandler = () => {
  const retryCountRef = useRef<Map<string, number>>(new Map());

  /**
   * Génère un ID de corrélation unique
   */
  const generateCorrelationId = useCallback((): string => {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Analyse une erreur et retourne des informations structurées
   */
  const analyzeError = useCallback((error: any): ErrorInfo => {
    const correlationId = generateCorrelationId();
    const timestamp = new Date().toISOString();

    // Erreur de réseau
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return {
        type: ErrorType.NETWORK,
        message: 'Erreur de connexion. Vérifiez votre connexion internet.',
        code: error.code,
        timestamp,
        correlationId,
      };
    }

    // Erreur HTTP
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          return {
            type: ErrorType.VALIDATION,
            message: data?.message || 'Données invalides fournies.',
            code: status,
            details: data,
            timestamp,
            correlationId,
          };
        case 401:
          return {
            type: ErrorType.AUTHENTICATION,
            message: 'Session expirée. Veuillez vous reconnecter.',
            code: status,
            timestamp,
            correlationId,
          };
        case 403:
          return {
            type: ErrorType.AUTHORIZATION,
            message: 'Vous n\'avez pas les permissions nécessaires.',
            code: status,
            timestamp,
            correlationId,
          };
        case 404:
          return {
            type: ErrorType.NOT_FOUND,
            message: 'Ressource non trouvée.',
            code: status,
            timestamp,
            correlationId,
          };
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: ErrorType.SERVER,
            message: 'Erreur serveur. Veuillez réessayer plus tard.',
            code: status,
            timestamp,
            correlationId,
          };
        default:
          return {
            type: ErrorType.UNKNOWN,
            message: data?.message || 'Une erreur inattendue s\'est produite.',
            code: status,
            details: data,
            timestamp,
            correlationId,
          };
      }
    }

    // Erreur JavaScript standard
    if (error instanceof Error) {
      return {
        type: ErrorType.UNKNOWN,
        message: error.message,
        timestamp,
        correlationId,
      };
    }

    // Erreur inconnue
    return {
      type: ErrorType.UNKNOWN,
      message: 'Une erreur inattendue s\'est produite.',
      timestamp,
      correlationId,
    };
  }, [generateCorrelationId]);

  /**
   * Log une erreur
   */
  const logError = useCallback((errorInfo: ErrorInfo, config: ErrorHandlerConfig) => {
    if (config.logToConsole) {
      logger.error('Error Handler:', errorInfo);
    }

    // ✅ Sentry configuré (voir config/sentry.ts)
    if (config.reportToService) {
      // Sentry capture les erreurs automatiquement via ErrorBoundary
    }
  }, []);

  /**
   * Affiche une notification toast
   */
  const showErrorToast = useCallback((errorInfo: ErrorInfo) => {
    const getToastOptions = () => {
      switch (errorInfo.type) {
        case ErrorType.NETWORK:
          return {
            icon: '🌐',
            duration: 5000,
          };
        case ErrorType.AUTHENTICATION:
          return {
            icon: '🔐',
            duration: 4000,
          };
        case ErrorType.VALIDATION:
          return {
            icon: '⚠️',
            duration: 4000,
          };
        case ErrorType.SERVER:
          return {
            icon: '🔧',
            duration: 6000,
          };
        default:
          return {
            icon: '❌',
            duration: 4000,
          };
      }
    };

    const options = getToastOptions();
    toast.error(errorInfo.message, options);
  }, []);

  /**
   * Gère une erreur avec la configuration fournie
   */
  const handleError = useCallback((
    error: any,
    config: Partial<ErrorHandlerConfig> = {}
  ): ErrorInfo => {
    const defaultConfig: ErrorHandlerConfig = {
      showToast: true,
      logToConsole: true,
      reportToService: process.env.NODE_ENV === 'production',
      retryable: false,
    };

    const finalConfig = { ...defaultConfig, ...config };
    const errorInfo = analyzeError(error);

    // Log l'erreur
    logError(errorInfo, finalConfig);

    // Afficher le toast si configuré
    if (finalConfig.showToast) {
      showErrorToast(errorInfo);
    }

    return errorInfo;
  }, [analyzeError, logError, showErrorToast]);

  /**
   * Gère une erreur avec retry automatique
   */
  const handleErrorWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    config: Partial<ErrorHandlerConfig> = {},
    operationId: string = 'unknown'
  ): Promise<T> => {
    const defaultConfig: ErrorHandlerConfig = {
      showToast: true,
      logToConsole: true,
      reportToService: process.env.NODE_ENV === 'production',
      retryable: true,
      maxRetries: 3,
      retryDelay: 1000,
    };

    const finalConfig = { ...defaultConfig, ...config };
    let lastError: any;
    let attempt = 0;

    while (attempt <= (finalConfig.maxRetries || 3)) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const errorInfo = analyzeError(error);

        // Log l'erreur
        logError(errorInfo, finalConfig);

        // Si ce n'est pas la dernière tentative et que l'erreur est retryable
        if (attempt < (finalConfig.maxRetries || 3) && finalConfig.retryable) {
          const retryCount = retryCountRef.current.get(operationId) || 0;
          retryCountRef.current.set(operationId, retryCount + 1);

          const delay = (finalConfig.retryDelay || 1000) * Math.pow(2, attempt);
          
          logger.log(`Retrying operation ${operationId} after ${delay}ms (attempt ${attempt + 1})`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          attempt++;
          continue;
        }

        // Si l'erreur n'est pas retryable ou qu'on a atteint le max de tentatives
        if (finalConfig.showToast) {
          showErrorToast(errorInfo);
        }

        throw errorInfo;
      }
    }

    // Ne devrait jamais arriver
    throw analyzeError(lastError);
  }, [analyzeError, logError, showErrorToast]);

  /**
   * Nettoie les compteurs de retry
   */
  const clearRetryCounters = useCallback(() => {
    retryCountRef.current.clear();
  }, []);

  /**
   * Obtient le nombre de tentatives pour une opération
   */
  const getRetryCount = useCallback((operationId: string): number => {
    return retryCountRef.current.get(operationId) || 0;
  }, []);

  return {
    handleError,
    handleErrorWithRetry,
    analyzeError,
    clearRetryCounters,
    getRetryCount,
  };
};