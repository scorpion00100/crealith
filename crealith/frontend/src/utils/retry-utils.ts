/**
 * Utilitaires pour la logique de retry des appels API
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  attempts: number;
}

/**
 * Retry avec backoff exponentiel
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = defaultRetryCondition,
    onRetry,
  } = options;

  let lastError: any;
  let attempts = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attempts = attempt + 1;
    
    try {
      const result = await fn();
      return {
        success: true,
        data: result,
        attempts,
      };
    } catch (error) {
      lastError = error;
      
      // Si c'est la dernière tentative ou que la condition de retry n'est pas remplie
      if (attempt === maxRetries || !retryCondition(error)) {
        break;
      }

      // Calculer le délai avec backoff exponentiel
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      );

      // Appeler le callback de retry si fourni
      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      // Attendre avant la prochaine tentative
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: lastError,
    attempts,
  };
};

/**
 * Condition de retry par défaut
 * Retry pour les erreurs de réseau et les erreurs 5xx
 */
export const defaultRetryCondition = (error: any): boolean => {
  // Erreur de réseau
  if (!error.response) {
    return true;
  }

  // Erreurs 5xx (erreurs serveur)
  const status = error.response.status;
  if (status >= 500 && status < 600) {
    return true;
  }

  // Erreur de timeout
  if (status === 408) {
    return true;
  }

  // Erreur de rate limiting
  if (status === 429) {
    return true;
  }

  return false;
};

/**
 * Retry pour les erreurs d'authentification avec refresh token
 */
export const retryWithAuthRefresh = async <T>(
  fn: () => Promise<T>,
  refreshAuth: () => Promise<void>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> => {
  const {
    maxRetries = 2,
    baseDelay = 1000,
    onRetry,
  } = options;

  let lastError: any;
  let attempts = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attempts = attempt + 1;
    
    try {
      const result = await fn();
      return {
        success: true,
        data: result,
        attempts,
      };
    } catch (error) {
      lastError = error;
      
      // Si c'est une erreur 401 et qu'on n'a pas encore essayé de rafraîchir l'auth
      if (error.response?.status === 401 && attempt < maxRetries) {
        try {
          await refreshAuth();
          
          if (onRetry) {
            onRetry(attempt + 1, error);
          }
          
          // Attendre un peu avant de réessayer
          await new Promise(resolve => setTimeout(resolve, baseDelay));
          continue;
        } catch (refreshError) {
          // Si le refresh échoue, on arrête
          break;
        }
      }
      
      // Si ce n'est pas une erreur 401 ou qu'on a déjà essayé de rafraîchir
      break;
    }
  }

  return {
    success: false,
    error: lastError,
    attempts,
  };
};

/**
 * Retry avec jitter pour éviter le thundering herd
 */
export const retryWithJitter = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = defaultRetryCondition,
    onRetry,
  } = options;

  let lastError: any;
  let attempts = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attempts = attempt + 1;
    
    try {
      const result = await fn();
      return {
        success: true,
        data: result,
        attempts,
      };
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !retryCondition(error)) {
        break;
      }

      // Calculer le délai avec backoff exponentiel
      const baseDelayValue = baseDelay * Math.pow(backoffFactor, attempt);
      const maxDelayValue = Math.min(baseDelayValue, maxDelay);
      
      // Ajouter du jitter (randomisation) pour éviter le thundering herd
      const jitter = Math.random() * 0.1 * maxDelayValue; // 10% de jitter
      const delay = maxDelayValue + jitter;

      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: lastError,
    attempts,
  };
};

/**
 * Hook pour utiliser le retry dans les composants React
 */
export const useRetry = () => {
  const retry = async <T>(
    fn: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> => {
    const result = await retryWithBackoff(fn, options);
    
    if (!result.success) {
      throw result.error;
    }
    
    return result.data!;
  };

  const retryWithAuth = async <T>(
    fn: () => Promise<T>,
    refreshAuth: () => Promise<void>,
    options?: RetryOptions
  ): Promise<T> => {
    const result = await retryWithAuthRefresh(fn, refreshAuth, options);
    
    if (!result.success) {
      throw result.error;
    }
    
    return result.data!;
  };

  return {
    retry,
    retryWithAuth,
  };
};

/**
 * Wrapper pour axios avec retry automatique
 */
export const createRetryAxios = (axiosInstance: any, options: RetryOptions = {}) => {
  const originalRequest = axiosInstance.request;

  axiosInstance.request = async (config: any) => {
    const result = await retryWithBackoff(
      () => originalRequest(config),
      {
        ...options,
        retryCondition: (error) => {
          // Ne pas retry pour les requêtes qui ont déjà été retryées
          if (config._retryCount) {
            return false;
          }
          
          return options.retryCondition ? options.retryCondition(error) : defaultRetryCondition(error);
        },
        onRetry: (attempt, error) => {
          config._retryCount = attempt;
          if (options.onRetry) {
            options.onRetry(attempt, error);
          }
        },
      }
    );

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  };

  return axiosInstance;
};
