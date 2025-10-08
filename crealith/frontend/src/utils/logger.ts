/**
 * Logger conditionnel pour le frontend
 * - Logs debug/info/warn UNIQUEMENT en développement
 * - Logs error TOUJOURS (même en production)
 * - Évite les fuites de données en production
 */

const isDevelopment = import.meta.env.MODE === 'development';
const isTest = import.meta.env.MODE === 'test';

export const logger = {
  /**
   * Logs de debug (développement seulement)
   */
  log: (...args: any[]) => {
    if (isDevelopment || isTest) {
      console.log(...args);
    }
  },

  /**
   * Logs d'information (développement seulement)
   */
  info: (...args: any[]) => {
    if (isDevelopment || isTest) {
      console.info(...args);
    }
  },

  /**
   * Logs de warning (développement seulement)
   */
  warn: (...args: any[]) => {
    if (isDevelopment || isTest) {
      console.warn(...args);
    }
  },

  /**
   * Logs d'erreur (TOUJOURS, même en production)
   * Les erreurs critiques doivent être tracées
   */
  error: (...args: any[]) => {
    console.error(...args);
    
    // ✅ Sentry configuré (voir config/sentry.ts)
    // Les erreurs sont capturées automatiquement via ErrorBoundary et config/sentry.ts
  },

  /**
   * Logs de debug détaillés (développement seulement)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log de trace (développement seulement)
   */
  trace: (...args: any[]) => {
    if (isDevelopment) {
      console.trace(...args);
    }
  },

  /**
   * Groupe de logs (développement seulement)
   */
  group: (label: string) => {
    if (isDevelopment) {
      console.group(label);
    }
  },

  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },

  /**
   * Table (développement seulement)
   */
  table: (data: any) => {
    if (isDevelopment) {
      console.table(data);
    }
  },
};

/**
 * Logger spécifique pour les erreurs API
 */
export const apiLogger = {
  request: (method: string, url: string, data?: any) => {
    if (isDevelopment) {
      console.log(`🔵 API ${method} ${url}`, data);
    }
  },

  response: (method: string, url: string, status: number, data?: any) => {
    if (isDevelopment) {
      console.log(`🟢 API ${method} ${url} - ${status}`, data);
    }
  },

  error: (method: string, url: string, error: any) => {
    console.error(`🔴 API ${method} ${url}`, error);
  },
};

export default logger;

