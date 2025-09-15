import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { redisService } from '../services/redis.service';
import { SecureLogger } from '../utils/secure-logger';

/**
 * Configuration de rate limiting avec Redis
 */
interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  handler?: (req: Request, res: Response) => void;
}

/**
 * Rate limiter personnalisé avec Redis
 */
class CustomRateLimiter {
  private static instance: CustomRateLimiter;
  private limiters: Map<string, RateLimitRequestHandler> = new Map();

  static getInstance(): CustomRateLimiter {
    if (!CustomRateLimiter.instance) {
      CustomRateLimiter.instance = new CustomRateLimiter();
    }
    return CustomRateLimiter.instance;
  }

  /**
   * Crée un rate limiter avec configuration personnalisée
   */
  createLimiter(name: string, config: RateLimitConfig): RateLimitRequestHandler {
    if (this.limiters.has(name)) {
      return this.limiters.get(name)!;
    }

    const limiter = rateLimit({
      windowMs: config.windowMs,
      max: config.max,
      message: {
        error: 'Too Many Requests',
        message: config.message,
        retryAfter: Math.ceil(config.windowMs / 1000),
        timestamp: new Date().toISOString(),
      },
      standardHeaders: config.standardHeaders,
      legacyHeaders: config.legacyHeaders,
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
      handler: config.handler || this.defaultHandler,
      // store: new RedisStore({
      //   sendCommand: (...args: string[]) => {
      //     // Utiliser le service Redis existant
      //     return redisService['redis'].call(...args);
      //   },
      // }),
    });

    this.limiters.set(name, limiter);
    return limiter;
  }

  /**
   * Générateur de clé par défaut
   */
  private defaultKeyGenerator(req: Request): string {
    // Utiliser l'IP et l'User-Agent pour une identification unique
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    return `rate_limit:${ip}:${Buffer.from(userAgent).toString('base64')}`;
  }

  /**
   * Handler par défaut pour les requêtes limitées
   */
  private defaultHandler(req: Request, res: Response): void {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    SecureLogger.security('Rate limit exceeded', ip, userAgent, {
      endpoint: req.path,
      method: req.method,
      userAgent: userAgent.substring(0, 100),
    });

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(15 * 60 * 1000 / 1000), // 15 minutes
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Générateur de clé basé sur l'utilisateur authentifié
   */
  userKeyGenerator(req: Request): string {
    const userId = (req as any).user?.id;
    if (userId) {
      return `rate_limit:user:${userId}`;
    }
    return this.defaultKeyGenerator(req);
  }

  /**
   * Générateur de clé basé sur l'email (pour les tentatives de connexion)
   */
  emailKeyGenerator(req: Request): string {
    const email = req.body?.email;
    if (email) {
      return `rate_limit:email:${email}`;
    }
    return this.defaultKeyGenerator(req);
  }
}

/**
 * Store Redis personnalisé pour express-rate-limit
 */
// class RedisStore implements rateLimit.Store {
//   private sendCommand: (...args: string[]) => Promise<any>;

//   constructor(options: { sendCommand: (...args: string[]) => Promise<any> }) {
//     this.sendCommand = options.sendCommand;
//   }

//   async increment(key: string, cb: rateLimit.IncrementCallback): Promise<void> {
//     const pipeline = [
//       ['INCR', key],
//       ['EXPIRE', key, '900'], // 15 minutes
//     ];

//     try {
//       const results = await Promise.all(
//         pipeline.map(cmd => this.sendCommand(...cmd))
//       );

//       const totalHits = results[0];
//       const ttl = await this.sendCommand('TTL', key);

//       cb(null, totalHits, new Date(Date.now() + ttl * 1000));
//     } catch (error) {
//       cb(error as Error, 0, new Date());
//     }
//   }

//   async decrement(key: string): Promise<void> {
//     try {
//       await this.sendCommand('DECR', key);
//     } catch (error) {
//       // Ignorer les erreurs de décrémentation
//     }
//   }

//   async resetKey(key: string): Promise<void> {
//     try {
//       await this.sendCommand('DEL', key);
//     } catch (error) {
//       // Ignorer les erreurs de suppression
//     }
//   }
// }

// Instance singleton
const rateLimiter = CustomRateLimiter.getInstance();

/**
 * Rate limiters prédéfinis
 */
export const rateLimiters = {
  // Rate limiter général pour l'API
  general: rateLimiter.createLimiter('general', {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes par fenêtre
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Rate limiter strict pour l'authentification
  auth: rateLimiter.createLimiter('auth', {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives par fenêtre
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: rateLimiter.emailKeyGenerator.bind(rateLimiter),
  }),

  // Rate limiter pour les tentatives de connexion
  login: rateLimiter.createLimiter('login', {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 tentatives de connexion par fenêtre
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: rateLimiter.emailKeyGenerator.bind(rateLimiter),
  }),

  // Rate limiter pour les tentatives de réinitialisation de mot de passe
  passwordReset: rateLimiter.createLimiter('password-reset', {
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 3, // 3 tentatives par heure
    message: 'Too many password reset attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: rateLimiter.emailKeyGenerator.bind(rateLimiter),
  }),

  // Rate limiter pour les uploads de fichiers
  upload: rateLimiter.createLimiter('upload', {
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 20, // 20 uploads par heure
    message: 'Too many file uploads, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: rateLimiter.userKeyGenerator.bind(rateLimiter),
  }),

  // Rate limiter pour les créations de produits
  productCreation: rateLimiter.createLimiter('product-creation', {
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 10, // 10 produits par heure
    message: 'Too many product creations, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: rateLimiter.userKeyGenerator.bind(rateLimiter),
  }),

  // Rate limiter pour les commandes
  orders: rateLimiter.createLimiter('orders', {
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 50, // 50 commandes par heure
    message: 'Too many order requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: rateLimiter.userKeyGenerator.bind(rateLimiter),
  }),

  // Rate limiter pour les avis
  reviews: rateLimiter.createLimiter('reviews', {
    windowMs: 24 * 60 * 60 * 1000, // 24 heures
    max: 5, // 5 avis par jour
    message: 'Too many review submissions, please try again tomorrow.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: rateLimiter.userKeyGenerator.bind(rateLimiter),
  }),

  // Rate limiter pour les recherches
  search: rateLimiter.createLimiter('search', {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 recherches par minute
    message: 'Too many search requests, please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Rate limiter pour les webhooks
  webhooks: rateLimiter.createLimiter('webhooks', {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 webhooks par minute
    message: 'Too many webhook requests.',
    standardHeaders: true,
    legacyHeaders: false,
  }),
};

/**
 * Middleware de rate limiting dynamique basé sur le rôle
 */
export const dynamicRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  
  if (user) {
    // Utilisateurs authentifiés ont des limites plus élevées
    const multiplier = user.role === 'ADMIN' ? 3 : user.role === 'SELLER' ? 2 : 1;
    
    // Ajuster les limites dynamiquement
    const limiter = rateLimiter.createLimiter(`dynamic-${user.id}`, {
      windowMs: 15 * 60 * 1000,
      max: 100 * multiplier,
      message: 'Rate limit exceeded for authenticated user.',
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: () => `rate_limit:user:${user.id}`,
    });

    limiter(req, res, next);
  } else {
    // Utilisateurs non authentifiés
    rateLimiters.general(req, res, next);
  }
};

/**
 * Middleware de rate limiting pour les API publiques
 */
export const publicApiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requêtes par fenêtre
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many requests to public API, please try again later.',
    retryAfter: 900,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Utiliser l'IP et un identifiant de session si disponible
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const sessionId = req.get('X-Session-ID') || 'anonymous';
    return `rate_limit:public:${ip}:${sessionId}`;
  },
});

/**
 * Middleware de rate limiting pour les API privées
 */
export const privateApiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requêtes par fenêtre
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many requests to private API, please try again later.',
    retryAfter: 900,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    if (user) {
      return `rate_limit:private:user:${user.id}`;
    }
    return `rate_limit:private:ip:${req.ip || 'unknown'}`;
  },
});

/**
 * Fonction utilitaire pour créer un rate limiter personnalisé
 */
export const createCustomRateLimit = (config: RateLimitConfig): RateLimitRequestHandler => {
  return rateLimiter.createLimiter(`custom-${Date.now()}`, config);
};

/**
 * Middleware pour logger les tentatives de rate limiting
 */
export const rateLimitLogger = (req: Request, res: Response, next: NextFunction): void => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode === 429) {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
      SecureLogger.security('Rate limit triggered', ip, userAgent, {
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        userAgent: userAgent.substring(0, 100),
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

export default rateLimiters;
