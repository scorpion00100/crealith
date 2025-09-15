import { Request, Response } from 'express';
import { redisService } from '../services/redis.service';
import { SecureLogger } from './secure-logger';
import { generateSecureToken } from './crypto-utils';

/**
 * Interface pour les informations de session
 */
export interface SessionData {
  userId: string;
  email: string;
  role: string;
  loginTime: string;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  deviceId?: string;
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
}

/**
 * Interface pour les métadonnées de session
 */
export interface SessionMetadata {
  sessionId: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
  isActive: boolean;
  lastActivity: string;
}

/**
 * Configuration de session
 */
export interface SessionConfig {
  maxSessionsPerUser: number;
  sessionTimeout: number; // en secondes
  absoluteTimeout: number; // en secondes
  slidingExpiration: boolean;
  requireReauth: boolean;
  trackLocation: boolean;
  trackDevice: boolean;
}

/**
 * Configuration par défaut
 */
const DEFAULT_SESSION_CONFIG: SessionConfig = {
  maxSessionsPerUser: 5,
  sessionTimeout: 30 * 60, // 30 minutes
  absoluteTimeout: 24 * 60 * 60, // 24 heures
  slidingExpiration: true,
  requireReauth: false,
  trackLocation: true,
  trackDevice: true,
};

/**
 * Gestionnaire de sessions sécurisé
 */
export class SessionManager {
  private config: SessionConfig;

  constructor(config: SessionConfig = DEFAULT_SESSION_CONFIG) {
    this.config = config;
  }

  /**
   * Crée une nouvelle session
   */
  async createSession(
    userId: string,
    email: string,
    role: string,
    req: Request,
    res: Response
  ): Promise<{ sessionId: string; sessionData: SessionData }> {
    try {
      // Générer un ID de session sécurisé
      const sessionId = generateSecureToken(32);
      
      // Obtenir les informations de la requête
      const ipAddress = this.getClientIP(req);
      const userAgent = req.get('User-Agent') || 'unknown';
      const deviceId = this.generateDeviceId(req);
      
      // Créer les données de session
      const sessionData: SessionData = {
        userId,
        email,
        role,
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        ipAddress,
        userAgent,
        isActive: true,
        deviceId,
        location: this.config.trackLocation ? await this.getLocationInfo(ipAddress) : undefined,
      };

      // Vérifier le nombre de sessions actives
      await this.cleanupUserSessions(userId);
      
      // Stocker la session dans Redis
      const sessionKey = `session:${sessionId}`;
      const userSessionsKey = `user_sessions:${userId}`;
      
      await redisService['redis'].setex(
        sessionKey,
        this.config.absoluteTimeout,
        JSON.stringify(sessionData)
      );
      
      // Ajouter la session à la liste des sessions de l'utilisateur
      await redisService['redis'].sadd(userSessionsKey, sessionId);
      await redisService['redis'].expire(userSessionsKey, this.config.absoluteTimeout);
      
      // Créer les métadonnées de session
      const metadata: SessionMetadata = {
        sessionId,
        userId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.config.absoluteTimeout * 1000).toISOString(),
        ipAddress,
        userAgent,
        deviceId,
        isActive: true,
        lastActivity: new Date().toISOString(),
      };
      
      const metadataKey = `session_metadata:${sessionId}`;
      await redisService['redis'].setex(
        metadataKey,
        this.config.absoluteTimeout,
        JSON.stringify(metadata)
      );

      // Définir le cookie de session
      this.setSessionCookie(res, sessionId);

      // Log de la création de session
      SecureLogger.info('Session created', {
        userId,
        sessionId: sessionId.substring(0, 8) + '...',
        ipAddress,
        userAgent: userAgent.substring(0, 100),
        deviceId,
      });

      return { sessionId, sessionData };
    } catch (error) {
      SecureLogger.error('Failed to create session', error, { userId });
      throw error;
    }
  }

  /**
   * Valide une session
   */
  async validateSession(sessionId: string, req: Request): Promise<SessionData | null> {
    try {
      if (!sessionId) {
        return null;
      }

      const sessionKey = `session:${sessionId}`;
      const sessionDataStr = await redisService['redis'].get(sessionKey);
      
      if (!sessionDataStr) {
        return null;
      }

      const sessionData: SessionData = JSON.parse(sessionDataStr);
      
      // Vérifier si la session est active
      if (!sessionData.isActive) {
        return null;
      }

      // Vérifier l'expiration
      const now = new Date();
      const lastActivity = new Date(sessionData.lastActivity);
      const timeSinceLastActivity = (now.getTime() - lastActivity.getTime()) / 1000;

      if (timeSinceLastActivity > this.config.sessionTimeout) {
        await this.invalidateSession(sessionId);
        return null;
      }

      // Vérifier l'IP (optionnel, peut être désactivé pour la mobilité)
      const currentIP = this.getClientIP(req);
      if (sessionData.ipAddress !== currentIP) {
        SecureLogger.security('Session IP mismatch', currentIP, req.get('User-Agent') || 'unknown', {
          sessionId: sessionId.substring(0, 8) + '...',
          originalIP: sessionData.ipAddress,
          currentIP,
          userId: sessionData.userId,
        });
        
        // Optionnel : invalider la session en cas de changement d'IP
        // await this.invalidateSession(sessionId);
        // return null;
      }

      // Mettre à jour la dernière activité si sliding expiration est activé
      if (this.config.slidingExpiration) {
        await this.updateLastActivity(sessionId);
      }

      return sessionData;
    } catch (error) {
      SecureLogger.error('Failed to validate session', error, {
        sessionId: sessionId ? sessionId.substring(0, 8) + '...' : 'unknown',
      });
      return null;
    }
  }

  /**
   * Met à jour la dernière activité d'une session
   */
  async updateLastActivity(sessionId: string): Promise<void> {
    try {
      const sessionKey = `session:${sessionId}`;
      const sessionDataStr = await redisService['redis'].get(sessionKey);
      
      if (sessionDataStr) {
        const sessionData: SessionData = JSON.parse(sessionDataStr);
        sessionData.lastActivity = new Date().toISOString();
        
        await redisService['redis'].setex(
          sessionKey,
          this.config.absoluteTimeout,
          JSON.stringify(sessionData)
        );
      }
    } catch (error) {
      SecureLogger.error('Failed to update last activity', error, {
        sessionId: sessionId.substring(0, 8) + '...',
      });
    }
  }

  /**
   * Invalide une session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    try {
      const sessionKey = `session:${sessionId}`;
      const metadataKey = `session_metadata:${sessionId}`;
      
      // Récupérer les données de session pour obtenir l'userId
      const sessionDataStr = await redisService['redis'].get(sessionKey);
      let userId: string | undefined;
      
      if (sessionDataStr) {
        const sessionData: SessionData = JSON.parse(sessionDataStr);
        userId = sessionData.userId;
        
        // Supprimer la session de la liste des sessions de l'utilisateur
        const userSessionsKey = `user_sessions:${userId}`;
        await redisService['redis'].srem(userSessionsKey, sessionId);
      }
      
      // Supprimer la session et ses métadonnées
      await redisService['redis'].del(sessionKey);
      await redisService['redis'].del(metadataKey);
      
      SecureLogger.info('Session invalidated', {
        sessionId: sessionId.substring(0, 8) + '...',
        userId,
      });
    } catch (error) {
      SecureLogger.error('Failed to invalidate session', error, {
        sessionId: sessionId.substring(0, 8) + '...',
      });
    }
  }

  /**
   * Invalide toutes les sessions d'un utilisateur
   */
  async invalidateAllUserSessions(userId: string): Promise<number> {
    try {
      const userSessionsKey = `user_sessions:${userId}`;
      const sessionIds = await redisService['redis'].smembers(userSessionsKey);
      
      let invalidatedCount = 0;
      
      for (const sessionId of sessionIds) {
        await this.invalidateSession(sessionId);
        invalidatedCount++;
      }
      
      SecureLogger.info('All user sessions invalidated', {
        userId,
        sessionCount: invalidatedCount,
      });
      
      return invalidatedCount;
    } catch (error) {
      SecureLogger.error('Failed to invalidate all user sessions', error, { userId });
      return 0;
    }
  }

  /**
   * Obtient toutes les sessions actives d'un utilisateur
   */
  async getUserSessions(userId: string): Promise<SessionMetadata[]> {
    try {
      const userSessionsKey = `user_sessions:${userId}`;
      const sessionIds = await redisService['redis'].smembers(userSessionsKey);
      
      const sessions: SessionMetadata[] = [];
      
      for (const sessionId of sessionIds) {
        const metadataKey = `session_metadata:${sessionId}`;
        const metadataStr = await redisService['redis'].get(metadataKey);
        
        if (metadataStr) {
          const metadata: SessionMetadata = JSON.parse(metadataStr);
          sessions.push(metadata);
        }
      }
      
      return sessions.sort((a, b) => 
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );
    } catch (error) {
      SecureLogger.error('Failed to get user sessions', error, { userId });
      return [];
    }
  }

  /**
   * Nettoie les sessions expirées d'un utilisateur
   */
  async cleanupUserSessions(userId: string): Promise<void> {
    try {
      const userSessionsKey = `user_sessions:${userId}`;
      const sessionIds = await redisService['redis'].smembers(userSessionsKey);
      
      // Vérifier chaque session
      for (const sessionId of sessionIds) {
        const sessionKey = `session:${sessionId}`;
        const exists = await redisService['redis'].exists(sessionKey);
        
        if (!exists) {
          // Supprimer la session de la liste si elle n'existe plus
          await redisService['redis'].srem(userSessionsKey, sessionId);
        }
      }
      
      // Limiter le nombre de sessions actives
      const currentSessions = await redisService['redis'].smembers(userSessionsKey);
      if (currentSessions.length >= this.config.maxSessionsPerUser) {
        // Supprimer les sessions les plus anciennes
        const sessionsToRemove = currentSessions.slice(0, currentSessions.length - this.config.maxSessionsPerUser + 1);
        
        for (const sessionId of sessionsToRemove) {
          await this.invalidateSession(sessionId);
        }
      }
    } catch (error) {
      SecureLogger.error('Failed to cleanup user sessions', error, { userId });
    }
  }

  /**
   * Obtient l'IP du client
   */
  private getClientIP(req: Request): string {
    return (
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection as any)?.socket?.remoteAddress ||
      req.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
      req.get('X-Real-IP') ||
      'unknown'
    );
  }

  /**
   * Génère un ID de dispositif basé sur les informations de la requête
   */
  private generateDeviceId(req: Request): string {
    const userAgent = req.get('User-Agent') || '';
    const acceptLanguage = req.get('Accept-Language') || '';
    const acceptEncoding = req.get('Accept-Encoding') || '';
    
    const deviceString = `${userAgent}-${acceptLanguage}-${acceptEncoding}`;
    return generateSecureToken(16, deviceString);
  }

  /**
   * Obtient les informations de localisation (simplifié)
   */
  private async getLocationInfo(ipAddress: string): Promise<SessionData['location']> {
    // Dans une implémentation réelle, vous utiliseriez un service comme MaxMind
    // Pour l'exemple, on retourne des données factices
    return {
      country: 'Unknown',
      city: 'Unknown',
      timezone: 'UTC',
    };
  }

  /**
   * Définit le cookie de session
   */
  private setSessionCookie(res: Response, sessionId: string): void {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: this.config.absoluteTimeout * 1000,
      path: '/',
    });
  }

  /**
   * Supprime le cookie de session
   */
  clearSessionCookie(res: Response): void {
    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });
  }

  /**
   * Met à jour la configuration de session
   */
  updateConfig(newConfig: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    SecureLogger.info('Session configuration updated', { config: this.config });
  }

  /**
   * Obtient la configuration actuelle
   */
  getConfig(): SessionConfig {
    return { ...this.config };
  }

  /**
   * Obtient les statistiques de session
   */
  async getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
  }> {
    try {
      const sessionKeys = await redisService['redis'].keys('session:*');
      const metadataKeys = await redisService['redis'].keys('session_metadata:*');
      
      let activeSessions = 0;
      let expiredSessions = 0;
      
      for (const key of sessionKeys) {
        const exists = await redisService['redis'].exists(key);
        if (exists) {
          activeSessions++;
        } else {
          expiredSessions++;
        }
      }
      
      return {
        totalSessions: sessionKeys.length,
        activeSessions,
        expiredSessions,
      };
    } catch (error) {
      SecureLogger.error('Failed to get session stats', error);
      return {
        totalSessions: 0,
        activeSessions: 0,
        expiredSessions: 0,
      };
    }
  }
}

// Instance singleton
export const sessionManager = new SessionManager();

/**
 * Middleware pour gérer les sessions
 */
export const sessionMiddleware = async (req: Request, res: Response, next: any) => {
  try {
    const sessionId = req.cookies?.sessionId || req.get('X-Session-ID');
    
    if (sessionId) {
      const sessionData = await sessionManager.validateSession(sessionId, req);
      if (sessionData) {
        (req as any).session = sessionData;
        (req as any).sessionId = sessionId;
      }
    }
    
    next();
  } catch (error) {
    SecureLogger.error('Session middleware error', error);
    next();
  }
};

/**
 * Middleware pour exiger une session active
 */
export const requireSession = (req: Request, res: Response, next: any) => {
  if (!(req as any).session) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid session required',
      timestamp: new Date().toISOString(),
    });
  }
  
  next();
};

export default sessionManager;
