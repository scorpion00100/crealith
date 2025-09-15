import Stripe from 'stripe';
import { SecureLogger } from './secure-logger';
import { createError } from './errors';

/**
 * Types d'erreurs Stripe avec gestion spécialisée
 */
export enum StripeErrorType {
  CARD_ERROR = 'card_error',
  INVALID_REQUEST_ERROR = 'invalid_request_error',
  API_ERROR = 'api_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  PERMISSION_ERROR = 'permission_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  IDEMPOTENCY_ERROR = 'idempotency_error',
  INVALID_GRANT = 'invalid_grant',
  CONNECTION_ERROR = 'connection_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Configuration pour la gestion des erreurs Stripe
 */
export interface StripeErrorConfig {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  retryableErrors: StripeErrorType[];
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Informations détaillées sur une erreur Stripe
 */
export interface StripeErrorInfo {
  type: StripeErrorType;
  code?: string;
  message: string;
  retryable: boolean;
  userMessage: string;
  correlationId: string;
  timestamp: string;
  operation: string;
  metadata?: any;
}

/**
 * Gestionnaire d'erreurs Stripe avec retry automatique et logging sécurisé
 */
export class StripeErrorHandler {
  private static readonly DEFAULT_CONFIG: StripeErrorConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    retryableErrors: [
      StripeErrorType.API_ERROR,
      StripeErrorType.RATE_LIMIT_ERROR,
      StripeErrorType.CONNECTION_ERROR
    ],
    logLevel: 'error'
  };

  /**
   * Analyse une erreur Stripe et retourne des informations structurées
   */
  static analyzeError(error: any, operation: string, metadata?: any): StripeErrorInfo {
    const correlationId = this.generateCorrelationId();
    const timestamp = new Date().toISOString();

    // Erreur Stripe standard
    if (error instanceof Stripe.errors.StripeError) {
      const stripeError = error as Stripe.errors.StripeError;
      
      return {
        type: this.mapStripeErrorType(stripeError.type),
        code: stripeError.code,
        message: stripeError.message,
        retryable: this.isRetryableError(stripeError.type),
        userMessage: this.getUserFriendlyMessage(stripeError),
        correlationId,
        timestamp,
        operation,
        metadata: this.sanitizeMetadata(metadata)
      };
    }

    // Erreur réseau ou autre
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return {
        type: StripeErrorType.CONNECTION_ERROR,
        message: error.message,
        retryable: true,
        userMessage: 'Une erreur de connexion s\'est produite. Veuillez réessayer.',
        correlationId,
        timestamp,
        operation,
        metadata: this.sanitizeMetadata(metadata)
      };
    }

    // Erreur inconnue
    return {
      type: StripeErrorType.UNKNOWN_ERROR,
      message: error.message || 'Erreur inconnue',
      retryable: false,
      userMessage: 'Une erreur inattendue s\'est produite. Veuillez contacter le support.',
      correlationId,
      timestamp,
      operation,
      metadata: this.sanitizeMetadata(metadata)
    };
  }

  /**
   * Mappe les types d'erreurs Stripe vers nos types internes
   */
  private static mapStripeErrorType(stripeType: string): StripeErrorType {
    switch (stripeType) {
      case 'card_error':
        return StripeErrorType.CARD_ERROR;
      case 'invalid_request_error':
        return StripeErrorType.INVALID_REQUEST_ERROR;
      case 'api_error':
        return StripeErrorType.API_ERROR;
      case 'authentication_error':
        return StripeErrorType.AUTHENTICATION_ERROR;
      case 'permission_error':
        return StripeErrorType.PERMISSION_ERROR;
      case 'rate_limit_error':
        return StripeErrorType.RATE_LIMIT_ERROR;
      case 'idempotency_error':
        return StripeErrorType.IDEMPOTENCY_ERROR;
      case 'invalid_grant':
        return StripeErrorType.INVALID_GRANT;
      default:
        return StripeErrorType.UNKNOWN_ERROR;
    }
  }

  /**
   * Détermine si une erreur peut être retryée
   */
  private static isRetryableError(errorType: string): boolean {
    const retryableTypes = [
      'api_error',
      'rate_limit_error',
      'connection_error'
    ];
    return retryableTypes.includes(errorType);
  }

  /**
   * Génère un message utilisateur-friendly
   */
  private static getUserFriendlyMessage(error: Stripe.errors.StripeError): string {
    if (error instanceof Stripe.errors.StripeCardError) {
      return this.getCardErrorMessage(error.code);
    }
    
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      return 'Les informations fournies sont invalides. Veuillez vérifier vos données.';
    }
    
    if (error instanceof Stripe.errors.StripeAPIError) {
      return 'Une erreur temporaire s\'est produite. Veuillez réessayer dans quelques instants.';
    }
    
    if (error instanceof Stripe.errors.StripeAuthenticationError) {
      return 'Erreur d\'authentification. Veuillez contacter le support.';
    }
    
    if (error instanceof Stripe.errors.StripePermissionError) {
      return 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.';
    }
    
    if (error instanceof Stripe.errors.StripeRateLimitError) {
      return 'Trop de requêtes. Veuillez attendre un moment avant de réessayer.';
    }
    
    if (error instanceof Stripe.errors.StripeIdempotencyError) {
      return 'Cette opération a déjà été effectuée.';
    }
    
    return 'Une erreur s\'est produite lors du traitement de votre demande.';
  }

  /**
   * Messages spécifiques pour les erreurs de carte
   */
  private static getCardErrorMessage(code?: string): string {
    switch (code) {
      case 'card_declined':
        return 'Votre carte a été refusée. Veuillez contacter votre banque.';
      case 'expired_card':
        return 'Votre carte a expiré. Veuillez utiliser une autre carte.';
      case 'incorrect_cvc':
        return 'Le code de sécurité de votre carte est incorrect.';
      case 'processing_error':
        return 'Une erreur s\'est produite lors du traitement de votre carte.';
      case 'insufficient_funds':
        return 'Fonds insuffisants sur votre compte.';
      case 'withdraw_count_limit_exceeded':
        return 'Limite de retrait dépassée.';
      default:
        return 'Erreur avec votre carte de paiement. Veuillez vérifier vos informations.';
    }
  }

  /**
   * Nettoie les métadonnées pour éviter les fuites de données sensibles
   */
  private static sanitizeMetadata(metadata?: any): any {
    if (!metadata) return undefined;

    const sanitized = { ...metadata };
    
    // Supprimer les champs sensibles
    const sensitiveFields = [
      'cardNumber', 'cvc', 'expiryMonth', 'expiryYear',
      'accountNumber', 'routingNumber', 'ssn', 'taxId'
    ];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        delete sanitized[field];
      }
    });

    return sanitized;
  }

  /**
   * Génère un ID de corrélation pour le tracking
   */
  private static generateCorrelationId(): string {
    return `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log une erreur Stripe de manière sécurisée
   */
  static logError(errorInfo: StripeErrorInfo, config: Partial<StripeErrorConfig> = {}): void {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    const logData = {
      correlationId: errorInfo.correlationId,
      type: errorInfo.type,
      code: errorInfo.code,
      operation: errorInfo.operation,
      retryable: errorInfo.retryable,
      timestamp: errorInfo.timestamp,
      metadata: errorInfo.metadata
    };

    switch (finalConfig.logLevel) {
      case 'debug':
        SecureLogger.debug(`Stripe error: ${errorInfo.message}`, logData);
        break;
      case 'info':
        SecureLogger.info(`Stripe error: ${errorInfo.message}`, logData);
        break;
      case 'warn':
        SecureLogger.warn(`Stripe error: ${errorInfo.message}`, logData);
        break;
      case 'error':
      default:
        SecureLogger.error(`Stripe error: ${errorInfo.message}`, new Error(errorInfo.message), logData);
        break;
    }
  }

  /**
   * Exécute une opération Stripe avec retry automatique
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    config: Partial<StripeErrorConfig> = {},
    metadata?: any
  ): Promise<T> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    let lastError: any;
    let attempt = 0;

    while (attempt <= finalConfig.maxRetries) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const errorInfo = this.analyzeError(error, operationName, metadata);
        
        this.logError(errorInfo, finalConfig);

        // Si ce n'est pas la dernière tentative et que l'erreur est retryable
        if (attempt < finalConfig.maxRetries && errorInfo.retryable) {
          const delay = finalConfig.exponentialBackoff 
            ? finalConfig.retryDelay * Math.pow(2, attempt)
            : finalConfig.retryDelay;

          SecureLogger.info(`Retrying Stripe operation after ${delay}ms`, {
            operation: operationName,
            attempt: attempt + 1,
            maxRetries: finalConfig.maxRetries,
            correlationId: errorInfo.correlationId
          });

          await this.sleep(delay);
          attempt++;
          continue;
        }

        // Si l'erreur n'est pas retryable ou qu'on a atteint le max de tentatives
        throw this.createStripeError(errorInfo);
      }
    }

    // Ne devrait jamais arriver, mais au cas où
    throw this.createStripeError(this.analyzeError(lastError, operationName, metadata));
  }

  /**
   * Crée une erreur personnalisée à partir des informations d'erreur Stripe
   */
  private static createStripeError(errorInfo: StripeErrorInfo): Error {
    const error = new Error(errorInfo.userMessage);
    (error as any).stripeErrorInfo = errorInfo;
    (error as any).correlationId = errorInfo.correlationId;
    return error;
  }

  /**
   * Fonction utilitaire pour attendre
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Valide la configuration Stripe
   */
  static validateStripeConfig(): void {
    const requiredEnvVars = [
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY'
    ];

    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      const error = new Error(`Missing required Stripe environment variables: ${missing.join(', ')}`);
      SecureLogger.error('Stripe configuration validation failed', error);
      throw error;
    }

    // Valider le format des clés
    const secretKey = process.env.STRIPE_SECRET_KEY!;
    if (!secretKey.startsWith('sk_')) {
      const error = new Error('Invalid Stripe secret key format');
      SecureLogger.error('Stripe configuration validation failed', error);
      throw error;
    }

    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY!;
    if (!publishableKey.startsWith('pk_')) {
      const error = new Error('Invalid Stripe publishable key format');
      SecureLogger.error('Stripe configuration validation failed', error);
      throw error;
    }

    SecureLogger.info('Stripe configuration validated successfully');
  }

  /**
   * Obtient les statistiques d'erreurs pour le monitoring
   */
  static getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    retryableErrors: number;
    lastErrorTime?: string;
  } {
    // Cette méthode pourrait être étendue pour stocker des statistiques
    // dans Redis ou une base de données pour le monitoring
    return {
      totalErrors: 0,
      errorsByType: {},
      retryableErrors: 0
    };
  }
}
