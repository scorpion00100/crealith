import { SecureLogger } from './secure-logger';

/**
 * Configuration sécurisée pour Redis
 */
export interface SecureRedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  maxRetriesPerRequest: number;
  lazyConnect: boolean;
  showFriendlyErrorStack: boolean;
  connectTimeout: number;
  commandTimeout: number;
  retryDelayOnFailover: number;
  enableReadyCheck: boolean;
  retryDelayOnClusterDown: number;
  enableOfflineQueue: boolean;
  // Configuration de sécurité
  tls?: {
    rejectUnauthorized: boolean;
    checkServerIdentity?: (servername: string, cert: any) => Error | undefined;
  };
  // Configuration de connexion sécurisée
  family?: number; // Force IPv4 ou IPv6
  keepAlive?: number;
  keepAliveInitialDelay?: number;
}

/**
 * Validation et sécurisation de la configuration Redis
 */
export class RedisSecurityValidator {
  private static readonly MIN_PASSWORD_LENGTH = 8;
  private static readonly ALLOWED_PORTS = [6379, 6380, 16379, 16380];
  private static readonly MAX_RETRIES = 5;
  private static readonly MIN_TIMEOUT = 1000;
  private static readonly MAX_TIMEOUT = 30000;

  /**
   * Valide la configuration Redis pour la sécurité
   */
  static validateConfig(config: Partial<SecureRedisConfig>): SecureRedisConfig {
    const errors: string[] = [];

    // Validation de l'hôte
    if (!config.host || typeof config.host !== 'string') {
      errors.push('Redis host is required and must be a string');
    } else if (config.host === 'localhost' && process.env.NODE_ENV === 'production') {
      errors.push('Using localhost in production is not secure');
    }

    // Validation du port
    if (!config.port || typeof config.port !== 'number') {
      errors.push('Redis port is required and must be a number');
    } else if (!this.ALLOWED_PORTS.includes(config.port)) {
      errors.push(`Redis port ${config.port} is not in allowed ports: ${this.ALLOWED_PORTS.join(', ')}`);
    }

    // Validation du mot de passe en production
    if (process.env.NODE_ENV === 'production') {
      if (!config.password || typeof config.password !== 'string') {
        errors.push('Redis password is required in production');
      } else if (config.password.length < this.MIN_PASSWORD_LENGTH) {
        errors.push(`Redis password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`);
      }
    }

    // Validation de la base de données
    if (config.db === undefined || typeof config.db !== 'number' || config.db < 0 || config.db > 15) {
      errors.push('Redis database must be a number between 0 and 15');
    }

    // Validation des timeouts
    if (config.connectTimeout && (config.connectTimeout < this.MIN_TIMEOUT || config.connectTimeout > this.MAX_TIMEOUT)) {
      errors.push(`Connect timeout must be between ${this.MIN_TIMEOUT} and ${this.MAX_TIMEOUT} ms`);
    }

    if (config.commandTimeout && (config.commandTimeout < this.MIN_TIMEOUT || config.commandTimeout > this.MAX_TIMEOUT)) {
      errors.push(`Command timeout must be between ${this.MIN_TIMEOUT} and ${this.MAX_TIMEOUT} ms`);
    }

    if (errors.length > 0) {
      const errorMessage = `Redis configuration validation failed: ${errors.join(', ')}`;
      SecureLogger.security(`Redis configuration validation failed: ${errors.join(', ')}`);
      throw new Error(errorMessage);
    }

    // Configuration sécurisée par défaut
    return {
      host: config.host!,
      port: config.port!,
      password: config.password,
      db: config.db!,
      maxRetriesPerRequest: Math.min(config.maxRetriesPerRequest || 3, this.MAX_RETRIES),
      lazyConnect: config.lazyConnect !== false,
      showFriendlyErrorStack: config.showFriendlyErrorStack === true && process.env.NODE_ENV === 'development',
      connectTimeout: config.connectTimeout || 10000,
      commandTimeout: config.commandTimeout || 5000,
      retryDelayOnFailover: config.retryDelayOnFailover || 100,
      enableReadyCheck: config.enableReadyCheck !== false,
      retryDelayOnClusterDown: config.retryDelayOnClusterDown || 300,
      enableOfflineQueue: config.enableOfflineQueue !== false,
      tls: config.tls,
      family: config.family || 4, // IPv4 par défaut
      keepAlive: config.keepAlive || 0,
      keepAliveInitialDelay: config.keepAliveInitialDelay || 0,
    };
  }

  /**
   * Génère une configuration Redis sécurisée à partir des variables d'environnement
   */
  static createSecureConfig(): SecureRedisConfig {
    const config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
      connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000'),
      commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT || '5000'),
      tls: process.env.REDIS_TLS === 'true' ? {
        rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false',
      } : undefined,
    };

    return this.validateConfig(config);
  }

  /**
   * Valide les clés Redis pour éviter les injections
   */
  static validateKey(key: string): boolean {
    if (!key || typeof key !== 'string') {
      return false;
    }

    // Vérifier la longueur
    if (key.length > 250) {
      return false;
    }

    // Vérifier les caractères dangereux
    const dangerousChars = /[<>:"|?*\x00-\x1f]/;
    if (dangerousChars.test(key)) {
      return false;
    }

    // Vérifier les patterns de préfixe autorisés
    const allowedPrefixes = [
      'refresh_token',
      'reset_token',
      'user_tokens',
      'session',
      'cache',
      'rate_limit',
      'lock',
    ];

    const hasValidPrefix = allowedPrefixes.some(prefix => key.startsWith(prefix));
    if (!hasValidPrefix) {
      SecureLogger.security(`Redis key with invalid prefix detected: ${key.substring(0, 20)}...`);
      return false;
    }

    return true;
  }

  /**
   * Sanitise une clé Redis
   */
  static sanitizeKey(key: string): string {
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid key provided');
    }

    // Remplacer les caractères dangereux
    return key
      .replace(/[<>:"|?*\x00-\x1f]/g, '_')
      .substring(0, 250);
  }

  /**
   * Valide les données stockées dans Redis
   */
  static validateData(data: any): boolean {
    if (data === null || data === undefined) {
      return true;
    }

    // Vérifier la taille des données
    const dataString = JSON.stringify(data);
    if (dataString.length > 512 * 1024) { // 512KB max
      return false;
    }

    // Vérifier les types autorisés
    const allowedTypes = ['string', 'number', 'boolean', 'object'];
    if (!allowedTypes.includes(typeof data)) {
      return false;
    }

    return true;
  }

  /**
   * Génère un nom de clé sécurisé avec préfixe
   */
  static generateSecureKey(prefix: string, identifier: string, suffix?: string): string {
    if (!this.validateKey(prefix)) {
      throw new Error(`Invalid prefix: ${prefix}`);
    }

    // Sanitiser l'identifiant
    const sanitizedId = identifier.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    let key = `${prefix}${sanitizedId}`;
    if (suffix) {
      const sanitizedSuffix = suffix.replace(/[^a-zA-Z0-9_-]/g, '_');
      key += `:${sanitizedSuffix}`;
    }

    return this.sanitizeKey(key);
  }

  /**
   * Vérifie si une connexion Redis est sécurisée
   */
  static isSecureConnection(config: SecureRedisConfig): boolean {
    // En production, TLS et mot de passe sont requis
    if (process.env.NODE_ENV === 'production') {
      return !!(config.tls && config.password);
    }

    // En développement, au moins un des deux est recommandé
    return !!(config.tls || config.password);
  }
}
