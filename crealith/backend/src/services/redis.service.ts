import Redis from 'ioredis';
import { SecureLogger } from '../utils/secure-logger';
import { RedisSecurityValidator, SecureRedisConfig } from '../utils/redis-security';

class RedisService {
  private redis: Redis;
  private isConnected = false;
  private config: SecureRedisConfig;

  constructor() {
    try {
      // Configuration sécurisée
      this.config = RedisSecurityValidator.createSecureConfig();
      
      // Vérifier la sécurité de la connexion
      if (!RedisSecurityValidator.isSecureConnection(this.config)) {
        SecureLogger.security('Redis connection is not secure', undefined, undefined, {
          hasTls: !!this.config.tls,
          hasPassword: !!this.config.password,
          environment: process.env.NODE_ENV
        });
      }

      this.redis = new Redis(this.config);
      this.setupEventHandlers();
      
      SecureLogger.info('Redis service initialized with secure configuration', {
        host: this.config.host,
        port: this.config.port,
        db: this.config.db,
        hasTls: !!this.config.tls,
        hasPassword: !!this.config.password
      });
    } catch (error) {
      SecureLogger.error('Failed to initialize Redis service', error);
      throw error;
    }
  }

  private setupEventHandlers() {
    this.redis.on('connect', () => {
      this.isConnected = true;
      SecureLogger.info('Redis connected successfully', {
        host: this.config.host,
        port: this.config.port,
        db: this.config.db
      });
    });

    this.redis.on('error', (error) => {
      this.isConnected = false;
      SecureLogger.error('Redis connection error', error, {
        host: this.config.host,
        port: this.config.port,
        db: this.config.db
      });
    });

    this.redis.on('close', () => {
      this.isConnected = false;
      SecureLogger.warn('Redis connection closed', {
        host: this.config.host,
        port: this.config.port,
        db: this.config.db
      });
    });

    this.redis.on('reconnecting', () => {
      SecureLogger.info('Redis reconnecting...', {
        host: this.config.host,
        port: this.config.port,
        db: this.config.db
      });
    });

    this.redis.on('ready', () => {
      SecureLogger.info('Redis is ready to accept commands', {
        host: this.config.host,
        port: this.config.port,
        db: this.config.db
      });
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.redis.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.redis.disconnect();
    }
  }

  // Gestion des refresh tokens
  async storeRefreshToken(token: string, userId: string, expiresIn: number = 7 * 24 * 60 * 60): Promise<void> {
    try {
      // Validation des paramètres
      if (!token || !userId) {
        throw new Error('Token and userId are required');
      }

      if (expiresIn <= 0 || expiresIn > 30 * 24 * 60 * 60) { // Max 30 jours
        throw new Error('Invalid expiration time');
      }

      // Génération de clés sécurisées
      const key = RedisSecurityValidator.generateSecureKey('refresh_token', token);
      const userTokensKey = RedisSecurityValidator.generateSecureKey('user_tokens', userId);

      const value = JSON.stringify({
        userId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      });

      // Validation des données
      if (!RedisSecurityValidator.validateData(value)) {
        throw new Error('Invalid data format');
      }

      await this.redis.setex(key, expiresIn, value);
      
      // Ajouter à la liste des tokens de l'utilisateur
      await this.redis.sadd(userTokensKey, token);
      await this.redis.expire(userTokensKey, expiresIn);
      
      SecureLogger.debug('Refresh token stored', {
        userId: userId.substring(0, 8) + '...',
        expiresIn,
        keyPrefix: 'refresh_token'
      });
    } catch (error) {
      SecureLogger.error('Error storing refresh token', error, {
        userId: userId ? userId.substring(0, 8) + '...' : 'unknown'
      });
      throw error;
    }
  }

  async getRefreshToken(token: string): Promise<{ userId: string; createdAt: string; expiresAt: string } | null> {
    try {
      if (!token) {
        return null;
      }

      const key = RedisSecurityValidator.generateSecureKey('refresh_token', token);
      const value = await this.redis.get(key);
      
      if (!value) {
        return null;
      }

      const parsed = JSON.parse(value);
      
      // Validation des données retournées
      if (!parsed.userId || !parsed.createdAt || !parsed.expiresAt) {
        SecureLogger.security('Invalid refresh token data structure', undefined, undefined, {
          tokenPrefix: token.substring(0, 8) + '...'
        });
        return null;
      }

      return parsed;
    } catch (error) {
      SecureLogger.error('Error getting refresh token', error, {
        tokenPrefix: token ? token.substring(0, 8) + '...' : 'unknown'
      });
      return null;
    }
  }

  async revokeRefreshToken(token: string): Promise<boolean> {
    try {
      if (!token) {
        return false;
      }

      const key = RedisSecurityValidator.generateSecureKey('refresh_token', token);
      const tokenData = await this.getRefreshToken(token);
      
      if (tokenData) {
        // Supprimer le token
        await this.redis.del(key);
        
        // Supprimer de la liste des tokens de l'utilisateur
        const userTokensKey = RedisSecurityValidator.generateSecureKey('user_tokens', tokenData.userId);
        await this.redis.srem(userTokensKey, token);
        
        SecureLogger.debug('Refresh token revoked', {
          userId: tokenData.userId.substring(0, 8) + '...',
          tokenPrefix: token.substring(0, 8) + '...'
        });
        return true;
      }
      
      return false;
    } catch (error) {
      SecureLogger.error('Error revoking refresh token', error, {
        tokenPrefix: token ? token.substring(0, 8) + '...' : 'unknown'
      });
      return false;
    }
  }

  async revokeAllUserTokens(userId: string): Promise<number> {
    try {
      if (!userId) {
        return 0;
      }

      const userTokensKey = RedisSecurityValidator.generateSecureKey('user_tokens', userId);
      const tokens = await this.redis.smembers(userTokensKey);
      
      if (tokens.length === 0) {
        return 0;
      }

      // Supprimer tous les tokens de l'utilisateur
      const pipeline = this.redis.pipeline();
      
      tokens.forEach(token => {
        const key = RedisSecurityValidator.generateSecureKey('refresh_token', token);
        pipeline.del(key);
      });
      
      pipeline.del(userTokensKey);
      await pipeline.exec();
      
      SecureLogger.debug('All user tokens revoked', {
        userId: userId.substring(0, 8) + '...',
        tokenCount: tokens.length
      });
      return tokens.length;
    } catch (error) {
      SecureLogger.error('Error revoking all user tokens', error, {
        userId: userId ? userId.substring(0, 8) + '...' : 'unknown'
      });
      return 0;
    }
  }

  async getUserTokens(userId: string): Promise<string[]> {
    try {
      if (!userId) {
        return [];
      }

      const userTokensKey = RedisSecurityValidator.generateSecureKey('user_tokens', userId);
      return await this.redis.smembers(userTokensKey);
    } catch (error) {
      SecureLogger.error('Error getting user tokens', error, {
        userId: userId ? userId.substring(0, 8) + '...' : 'unknown'
      });
      return [];
    }
  }

  async getActiveSessions(userId: string): Promise<Array<{ token: string; createdAt: string; expiresAt: string }>> {
    try {
      if (!userId) {
        return [];
      }

      const tokens = await this.getUserTokens(userId);
      const sessions = [];

      for (const token of tokens) {
        const tokenData = await this.getRefreshToken(token);
        if (tokenData) {
          sessions.push({
            token: token.substring(0, 8) + '...', // Masquer le token complet
            createdAt: tokenData.createdAt,
            expiresAt: tokenData.expiresAt
          });
        }
      }

      return sessions;
    } catch (error) {
      SecureLogger.error('Error getting active sessions', error, {
        userId: userId ? userId.substring(0, 8) + '...' : 'unknown'
      });
      return [];
    }
  }

  async isTokenValid(token: string): Promise<boolean> {
    try {
      if (!token) {
        return false;
      }

      const tokenData = await this.getRefreshToken(token);
      if (!tokenData) {
        return false;
      }

      const expiresAt = new Date(tokenData.expiresAt);
      const isValid = expiresAt > new Date();
      
      if (!isValid) {
        SecureLogger.debug('Token validation failed - expired', {
          tokenPrefix: token.substring(0, 8) + '...',
          expiresAt: tokenData.expiresAt
        });
      }

      return isValid;
    } catch (error) {
      SecureLogger.error('Error checking token validity', error, {
        tokenPrefix: token ? token.substring(0, 8) + '...' : 'unknown'
      });
      return false;
    }
  }

  // Verrouillage temporaire des connexions (anti-bruteforce)
  async registerLoginFailure(email: string): Promise<void> {
    const keyBase = normalizeEmailForKey(email);
    const failKey = RedisSecurityValidator.generateSecureKey('rate_limit', `login_fail_${keyBase}`);
    const lockKey = RedisSecurityValidator.generateSecureKey('lock', `login_${keyBase}`);
    try {
      const locked = await this.redis.exists(lockKey);
      if (locked) return;
      const count = await this.redis.incr(failKey);
      if (count === 1) {
        await this.redis.expire(failKey, LOGIN_LOCK_MINUTES * 60);
      }
      if (count >= LOGIN_FAIL_LIMIT) {
        await this.redis.set(lockKey, '1', 'EX', LOGIN_LOCK_MINUTES * 60);
      }
    } catch (error) {
      SecureLogger.error('Error registering login failure', error, { email: keyBase.substring(0, 3) + '***' });
    }
  }

  async resetLoginFailures(email: string): Promise<void> {
    const keyBase = normalizeEmailForKey(email);
    const failKey = RedisSecurityValidator.generateSecureKey('rate_limit', `login_fail_${keyBase}`);
    try {
      await this.redis.del(failKey);
    } catch (error) {
      SecureLogger.error('Error resetting login failures', error, { email: keyBase.substring(0, 3) + '***' });
    }
  }

  async isLoginLocked(email: string): Promise<boolean> {
    const keyBase = normalizeEmailForKey(email);
    const lockKey = RedisSecurityValidator.generateSecureKey('lock', `login_${keyBase}`);
    try {
      const locked = await this.redis.exists(lockKey);
      return locked === 1;
    } catch (error) {
      SecureLogger.error('Error checking login lock', error, { email: keyBase.substring(0, 3) + '***' });
      return false;
    }
  }

  // Gestion des tokens de réinitialisation de mot de passe
  async storeResetToken(email: string, token: string, expiresIn: number = 60 * 60): Promise<void> {
    try {
      if (!email || !token) {
        throw new Error('Email and token are required');
      }

      if (expiresIn <= 0 || expiresIn > 24 * 60 * 60) { // Max 24 heures
        throw new Error('Invalid expiration time for reset token');
      }

      const key = RedisSecurityValidator.generateSecureKey('reset_token', token);
      const value = JSON.stringify({
        email,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      });

      // Validation des données
      if (!RedisSecurityValidator.validateData(value)) {
        throw new Error('Invalid data format for reset token');
      }

      await this.redis.setex(key, expiresIn, value);
      SecureLogger.debug('Reset token stored', {
        email: email.substring(0, 3) + '***@' + email.split('@')[1],
        expiresIn,
        keyPrefix: 'reset_token'
      });
    } catch (error) {
      SecureLogger.error('Error storing reset token', error, {
        email: email ? email.substring(0, 3) + '***@' + email.split('@')[1] : 'unknown'
      });
      throw error;
    }
  }

  async getResetToken(token: string): Promise<{ email: string; createdAt: string; expiresAt: string } | null> {
    try {
      if (!token) {
        return null;
      }

      const key = RedisSecurityValidator.generateSecureKey('reset_token', token);
      const value = await this.redis.get(key);
      
      if (!value) {
        return null;
      }

      const parsed = JSON.parse(value);
      
      // Validation des données retournées
      if (!parsed.email || !parsed.createdAt || !parsed.expiresAt) {
        SecureLogger.security('Invalid reset token data structure', undefined, undefined, {
          tokenPrefix: token.substring(0, 8) + '...'
        });
        return null;
      }

      return parsed;
    } catch (error) {
      SecureLogger.error('Error getting reset token', error, {
        tokenPrefix: token ? token.substring(0, 8) + '...' : 'unknown'
      });
      return null;
    }
  }

  async revokeResetToken(token: string): Promise<boolean> {
    try {
      if (!token) {
        return false;
      }

      const key = RedisSecurityValidator.generateSecureKey('reset_token', token);
      const result = await this.redis.del(key);
      
      if (result > 0) {
        SecureLogger.debug('Reset token revoked', {
          tokenPrefix: token.substring(0, 8) + '...'
        });
      }
      
      return result > 0;
    } catch (error) {
      SecureLogger.error('Error revoking reset token', error, {
        tokenPrefix: token ? token.substring(0, 8) + '...' : 'unknown'
      });
      return false;
    }
  }

  // Utilitaires
  async ping(): Promise<string> {
    return await this.redis.ping();
  }

  async getStats(): Promise<{ connected: boolean; keys: number; memory: string; uptime: number }> {
    try {
      const [keys, info] = await Promise.all([
        this.redis.dbsize(),
        this.redis.info('memory')
      ]);

      // Extraire la mémoire utilisée depuis les infos Redis
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memory = memoryMatch ? memoryMatch[1].trim() : 'unknown';

      // Extraire l'uptime depuis les infos Redis
      const uptimeMatch = info.match(/uptime_in_seconds:(\d+)/);
      const uptime = uptimeMatch ? parseInt(uptimeMatch[1]) : 0;

      return {
        connected: this.isConnected,
        keys,
        memory,
        uptime
      };
    } catch (error) {
      SecureLogger.error('Error getting Redis stats', error);
      return {
        connected: this.isConnected,
        keys: 0,
        memory: 'unknown',
        uptime: 0
      };
    }
  }

  // Nettoyage automatique des tokens expirés
  async cleanupExpiredTokens(): Promise<number> {
    try {
      // Cette fonction peut être appelée périodiquement pour nettoyer les tokens expirés
      // Redis gère automatiquement l'expiration avec TTL, mais on peut faire un nettoyage manuel
      const patterns = ['refresh_token:*', 'reset_token:*', 'user_tokens:*'];
      let totalCleaned = 0;

      for (const pattern of patterns) {
        const keys = await this.redis.keys(pattern);
        let cleaned = 0;

        for (const key of keys) {
          const ttl = await this.redis.ttl(key);
          if (ttl <= 0) {
            await this.redis.del(key);
            cleaned++;
          }
        }

        totalCleaned += cleaned;
      }

      if (totalCleaned > 0) {
        SecureLogger.info('Expired tokens cleaned up', {
          totalCleaned,
          patterns: patterns.length
        });
      }

      return totalCleaned;
    } catch (error) {
      SecureLogger.error('Error cleaning up expired tokens', error);
      return 0;
    }
  }

  // Nouvelles méthodes de sécurité
  async getConnectionInfo(): Promise<{
    host: string;
    port: number;
    db: number;
    isSecure: boolean;
    tls: boolean;
    hasPassword: boolean;
  }> {
    return {
      host: this.config.host,
      port: this.config.port,
      db: this.config.db,
      isSecure: RedisSecurityValidator.isSecureConnection(this.config),
      tls: !!this.config.tls,
      hasPassword: !!this.config.password
    };
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    connected: boolean;
    latency: number;
    memory: string;
    uptime: number;
  }> {
    try {
      const startTime = Date.now();
      await this.redis.ping();
      const latency = Date.now() - startTime;

      const stats = await this.getStats();

      return {
        status: this.isConnected && latency < 1000 ? 'healthy' : 'unhealthy',
        connected: this.isConnected,
        latency,
        memory: stats.memory,
        uptime: stats.uptime
      };
    } catch (error) {
      SecureLogger.error('Redis health check failed', error);
      return {
        status: 'unhealthy',
        connected: false,
        latency: -1,
        memory: 'unknown',
        uptime: 0
      };
    }
  }
}

export const redisService = new RedisService();
const normalizeEmailForKey = (email: string): string => {
  try {
    const [local, domain] = email.trim().toLowerCase().split('@');
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      const plusIndex = local.indexOf('+');
      const base = (plusIndex === -1 ? local : local.substring(0, plusIndex)).replace(/\./g, '');
      return `${base}@gmail.com`;
    }
    return `${local}@${domain}`;
  } catch {
    return email;
  }
};

const LOGIN_FAIL_LIMIT = 5; // tentatives
const LOGIN_LOCK_MINUTES = 15; // minutes
