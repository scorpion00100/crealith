import { logger } from './logger';

/**
 * Utilitaire pour sécuriser les logs en masquant les données sensibles
 */
export class SecureLogger {
  // Champs sensibles à masquer
  private static readonly SENSITIVE_FIELDS = [
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'privateKey',
    'stripeSecretKey',
    'imagekitPrivateKey',
    'redisPassword',
    'databaseUrl',
    'email',
    'phone',
    'creditCard',
    'cvv',
    'ssn',
    'socialSecurityNumber'
  ];

  // Patterns de données sensibles à masquer
  private static readonly SENSITIVE_PATTERNS = [
    /sk_test_[a-zA-Z0-9]+/g, // Stripe test keys
    /sk_live_[a-zA-Z0-9]+/g, // Stripe live keys
    /pk_test_[a-zA-Z0-9]+/g, // Stripe public test keys
    /pk_live_[a-zA-Z0-9]+/g, // Stripe public live keys
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email addresses
    /Bearer\s+[a-zA-Z0-9._-]+/g, // Bearer tokens
    /password[=:]\s*[^\s&]+/gi, // Password in query strings
    /token[=:]\s*[^\s&]+/gi, // Token in query strings
  ];

  /**
   * Masque les données sensibles dans un objet
   */
  private static maskSensitiveData(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.maskString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.maskSensitiveData(item));
    }

    if (typeof obj === 'object') {
      const masked: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = this.SENSITIVE_FIELDS.some(field => 
          lowerKey.includes(field.toLowerCase())
        );

        if (isSensitive) {
          masked[key] = '[MASKED]';
        } else {
          masked[key] = this.maskSensitiveData(value);
        }
      }
      return masked;
    }

    return obj;
  }

  /**
   * Masque les données sensibles dans une chaîne
   */
  private static maskString(str: string): string {
    let masked = str;
    
    // Appliquer les patterns de masquage
    this.SENSITIVE_PATTERNS.forEach(pattern => {
      masked = masked.replace(pattern, '[MASKED]');
    });

    return masked;
  }

  /**
   * Log sécurisé - masque automatiquement les données sensibles
   */
  static info(message: string, data?: any): void {
    const safeData = data ? this.maskSensitiveData(data) : undefined;
    logger.info(message, safeData);
  }

  static warn(message: string, data?: any): void {
    const safeData = data ? this.maskSensitiveData(data) : undefined;
    logger.warn(message, safeData);
  }

  static error(message: string, error?: any, data?: any): void {
    const safeData = data ? this.maskSensitiveData(data) : undefined;
    
    // Pour les erreurs, on log seulement le message et le type
    const safeError = error ? {
      message: error.message,
      name: error.name,
      code: error.code,
      status: error.status,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    } : undefined;

    logger.error(message, { error: safeError, ...safeData });
  }

  static debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      const safeData = data ? this.maskSensitiveData(data) : undefined;
      logger.debug(message, safeData);
    }
  }

  /**
   * Log d'audit sécurisé pour les actions sensibles
   */
  static audit(action: string, userId?: string, details?: any): void {
    const auditData = {
      action,
      userId: userId || '[ANONYMOUS]',
      timestamp: new Date().toISOString(),
      details: details ? this.maskSensitiveData(details) : undefined
    };

    logger.info('AUDIT', auditData);
  }

  /**
   * Log de sécurité pour les tentatives d'accès
   */
  static security(event: string, ip?: string, userAgent?: string, details?: any): void {
    const securityData = {
      event,
      ip: ip || '[UNKNOWN]',
      userAgent: userAgent || '[UNKNOWN]',
      timestamp: new Date().toISOString(),
      details: details ? this.maskSensitiveData(details) : undefined
    };

    logger.warn('SECURITY', securityData);
  }

  /**
   * Log de performance pour les requêtes lentes
   */
  static performance(operation: string, duration: number, details?: any): void {
    const perfData = {
      operation,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      details: details ? this.maskSensitiveData(details) : undefined
    };

    if (duration > 1000) {
      logger.warn('SLOW_OPERATION', perfData);
    } else {
      logger.debug('PERFORMANCE', perfData);
    }
  }
}

export default SecureLogger;
