import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { store } from '@/store';
import { setLoading } from '@/store/slices/uiSlice';
import { authService } from './auth.service';
import { retryWithBackoff, retryWithAuthRefresh, defaultRetryCondition } from '@/utils/retry-utils';
import { logger } from '@/utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Service HTTP centralisé basé sur Axios.
 * - Ajoute automatiquement le token d'auth
 * - Gère un indicateur de chargement global
 * - Gère le refresh token et un retry exponentiel configurable
 */
class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;
  private pendingRequests = 0;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Intercepteur pour ajouter le token d'authentification et gérer le chargement global
    this.api.interceptors.request.use(
      (config) => {
        // Incrémenter le compteur global de requêtes en attente
        this.pendingRequests += 1;
        
        // NE PAS afficher le loading global pour les actions rapides
        const url = config?.url || '';
        const method = config.method?.toLowerCase() || '';
        
        // Exclure : analytics, favoris, panier, reviews (actions rapides avec toasts)
        const isQuickRequest = url.includes('/analytics') || 
                               url.includes('/favorites') ||
                               url.includes('/cart') ||
                               url.includes('/reviews');
        
        // Afficher loading uniquement pour les requêtes longues (produits, checkout, auth)
        const isLongRequest = (url.includes('/products') && method === 'get') ||
                             url.includes('/checkout') ||
                             url.includes('/orders');
        
        if (isLongRequest && !isQuickRequest) {
          try { store.dispatch(setLoading(true)); } catch {}
        }
        
        const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');
        const token = authService.getToken();
        if (token && !isAuthRoute) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Add CSRF header for refresh/logout routes
        const needsCsrf = url.includes('/auth/refresh') || url.includes('/auth/logout');
        if (needsCsrf && typeof document !== 'undefined') {
          const match = document.cookie.match(/(?:^|; )csrfToken=([^;]+)/);
          const csrf = match ? decodeURIComponent(match[1]) : undefined;
          if (csrf) {
            (config.headers as any)['X-CSRF-Token'] = csrf;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur pour gérer les réponses et erreurs + chargement global
    this.api.interceptors.response.use(
      (response) => {
        // Décrémenter le compteur sur succès
        this.pendingRequests = Math.max(0, this.pendingRequests - 1);
        if (this.pendingRequests === 0) {
          try { store.dispatch(setLoading(false)); } catch {}
        }
        return response;
      },
      async (error) => {
        // Décrémenter le compteur sur erreur
        this.pendingRequests = Math.max(0, this.pendingRequests - 1);
        if (this.pendingRequests === 0) {
          try { store.dispatch(setLoading(false)); } catch {}
        }
        const { response } = error;
        const requestUrl: string = error?.config?.url || '';
        const originalRequest = error.config || {};
        
        if (response?.status === 401) {
          // Éviter de perturber le flux d'auth sur /auth/login et /auth/register
          const isAuthRoute = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register') || requestUrl.includes('/auth/register');
          const alreadyRetried = originalRequest.__isRetryRequest;
          
          if (!isAuthRoute && !alreadyRetried) {
            try {
              // Marquer la requête pour éviter boucle infinie
              originalRequest.__isRetryRequest = true;
              
              // Vérifier si on a un refresh token valide
              const refreshToken = localStorage.getItem('crealith_refresh');
              if (!refreshToken) {
                throw new Error('No refresh token available');
              }
              
              // Effectuer (ou attendre) un refresh unique
              await this.refreshAccessTokenOnce();
              
              // Réinjecter le nouvel access token et rejouer la requête
              const newToken = authService.getToken();
              if (newToken) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            } else {
              throw new Error('No new token received');
            }
          } catch (refreshError) {
            logger.warn('Token refresh failed:', refreshError);
            // Échec du refresh: déconnexion propre
            authService.logout();
            // Ne pas rediriger automatiquement, laisser l'utilisateur gérer
            return Promise.reject(error);
          }
        }
      } else if (response?.status === 403) {
        // Accès refusé
        logger.warn('Access denied:', response.data?.message || 'Insufficient permissions');
      } else if (response?.status === 429) {
        // Rate limit atteint
        logger.warn('Rate limit exceeded:', response.data?.message || 'Too many requests');
      } else if (response?.status >= 500) {
        // Erreur serveur
        logger.error('Server error:', response.data?.message || 'Internal server error');
      }
        
        return Promise.reject(error);
      }
    );
  }

  private getCookie(name: string): string | null {
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
      return null;
    } catch {
      return null;
    }
  }

  private async refreshAccessTokenOnce(): Promise<void> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const csrfToken = this.getCookie('csrfToken');
        const storedRefresh = localStorage.getItem('crealith_refresh');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

        const resp = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          storedRefresh ? { refreshToken: storedRefresh } : {},
          { headers, withCredentials: true }
        );

        const data = resp?.data || {};
        const accessToken = data.accessToken || data.data?.accessToken;
        const refreshToken = data.refreshToken || data.data?.refreshToken;
        if (accessToken) localStorage.setItem('crealith_token', accessToken);
        if (refreshToken) localStorage.setItem('crealith_refresh', refreshToken);
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Méthodes génériques avec retry
  async get<T>(url: string, params?: any, useRetry: boolean = true): Promise<T> {
    const requestFn = () => this.api.get(url, { params });
    
    if (useRetry) {
      const result = await retryWithBackoff(requestFn, {
        maxRetries: 3,
        baseDelay: 1000,
        retryCondition: defaultRetryCondition,
        onRetry: (attempt, error) => {
          logger.warn(`API GET retry attempt ${attempt} for ${url}:`, error.message);
        },
      });
      
      if (!result.success) {
        throw result.error;
      }
      // result.data is an AxiosResponse<T>
      return (result.data?.data as any) ?? (result.data as any);
    }
    
    const response: AxiosResponse<T> = await requestFn();
    return response.data;
  }

  async post<T>(url: string, data?: any, useRetry: boolean = true): Promise<T> {
    const requestFn = () => this.api.post(url, data);
    
    if (useRetry) {
      const result = await retryWithBackoff(requestFn, {
        maxRetries: 2, // Moins de retry pour les POST
        baseDelay: 1000,
        retryCondition: defaultRetryCondition,
        onRetry: (attempt, error) => {
          logger.warn(`API POST retry attempt ${attempt} for ${url}:`, error.message);
        },
      });
      
      if (!result.success) {
        throw result.error;
      }
      return (result.data?.data as any) ?? (result.data as any);
    }
    
    const response: AxiosResponse<T> = await requestFn();
    return response.data;
  }

  async put<T>(url: string, data?: any, useRetry: boolean = true): Promise<T> {
    const requestFn = () => this.api.put(url, data);
    
    if (useRetry) {
      const result = await retryWithBackoff(requestFn, {
        maxRetries: 2,
        baseDelay: 1000,
        retryCondition: defaultRetryCondition,
        onRetry: (attempt, error) => {
          logger.warn(`API PUT retry attempt ${attempt} for ${url}:`, error.message);
        },
      });
      
      if (!result.success) {
        throw result.error;
      }
      return (result.data?.data as any) ?? (result.data as any);
    }
    
    const response: AxiosResponse<T> = await requestFn();
    return response.data;
  }

  async delete<T>(url: string, useRetry: boolean = true): Promise<T> {
    const requestFn = () => this.api.delete(url);
    
    if (useRetry) {
      const result = await retryWithBackoff(requestFn, {
        maxRetries: 2,
        baseDelay: 1000,
        retryCondition: defaultRetryCondition,
        onRetry: (attempt, error) => {
          logger.warn(`API DELETE retry attempt ${attempt} for ${url}:`, error.message);
        },
      });
      
      if (!result.success) {
        throw result.error;
      }
      return (result.data?.data as any) ?? (result.data as any);
    }
    
    const response: AxiosResponse<T> = await requestFn();
    return response.data;
  }

  async upload<T>(url: string, formData: FormData, useRetry: boolean = false): Promise<T> {
    const requestFn = () => this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (useRetry) {
      const result = await retryWithBackoff(requestFn, {
        maxRetries: 1, // Très peu de retry pour les uploads
        baseDelay: 2000,
        retryCondition: (error) => {
          // Retry seulement pour les erreurs de réseau, pas pour les erreurs de validation
          return !error.response || error.response.status >= 500;
        },
        onRetry: (attempt, error) => {
          logger.warn(`API UPLOAD retry attempt ${attempt} for ${url}:`, error.message);
        },
      });
      
      if (!result.success) {
        throw result.error;
      }
      return (result.data?.data as any) ?? (result.data as any);
    }
    
    const response: AxiosResponse<T> = await requestFn();
    return response.data;
  }

  // Méthode avec retry et refresh d'authentification
  async authenticatedRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    refreshAuth: () => Promise<void>
  ): Promise<T> {
    const result = await retryWithAuthRefresh(
      requestFn,
      refreshAuth,
      {
        maxRetries: 1,
        baseDelay: 1000,
        onRetry: (attempt, error) => {
          logger.warn(`API authenticated retry attempt ${attempt}:`, error.message);
        },
      }
    );
    
    if (!result.success) {
      throw result.error;
    }
    return (result.data?.data as any) ?? (result.data as any);
  }
}

export const apiService = new ApiService();