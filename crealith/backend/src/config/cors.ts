import cors from 'cors';
import { Request } from 'express';
import { SecureLogger } from '../utils/secure-logger';

/**
 * Configuration CORS sécurisée
 */
export const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Liste des origines autorisées
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://crealith.com',
      'https://www.crealith.com',
      'https://app.crealith.com',
      'https://admin.crealith.com',
    ];

    // En développement, autoriser localhost avec n'importe quel port
    if (process.env.NODE_ENV === 'development') {
      const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
                         /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
                         /^https?:\/\/0\.0\.0\.0(:\d+)?$/.test(origin);
      
      if (isLocalhost) {
        return callback(null, true);
      }
    }

    // Vérifier si l'origine est autorisée
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Log des tentatives d'accès non autorisées
    SecureLogger.security('CORS: Unauthorized origin attempt', undefined, undefined, {
      origin,
      allowedOrigins: allowedOrigins.length,
      environment: process.env.NODE_ENV,
    });

    // Rejeter l'origine non autorisée
    callback(new Error('Not allowed by CORS'), false);
  },

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Session-ID',
    'X-Request-ID',
    'X-Correlation-ID',
    'X-Forwarded-For',
    'X-Real-IP',
  ],

  exposedHeaders: [
    'X-Request-ID',
    'X-Correlation-ID',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
    'X-Rate-Limit-Retry-After',
  ],

  credentials: true, // Autoriser les cookies et headers d'authentification

  maxAge: 86400, // Cache preflight requests for 24 hours

  preflightContinue: false,

  optionsSuccessStatus: 200,
};

/**
 * Configuration CORS pour les webhooks (plus permissive)
 */
export const webhookCorsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Pour les webhooks, on peut être plus permissif
    if (!origin) {
      return callback(null, true);
    }

    // Origines autorisées pour les webhooks
    const allowedWebhookOrigins = [
      'https://hooks.stripe.com',
      'https://api.stripe.com',
      'https://api.imagekit.io',
      'https://ik.imagekit.io',
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ];

    if (allowedWebhookOrigins.includes(origin)) {
      return callback(null, true);
    }

    // En développement, autoriser localhost
    if (process.env.NODE_ENV === 'development') {
      const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin);
      if (isLocalhost) {
        return callback(null, true);
      }
    }

    callback(new Error('Not allowed by CORS for webhooks'), false);
  },

  methods: ['POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Stripe-Signature',
    'X-ImageKit-Signature',
  ],
  credentials: false, // Les webhooks n'ont pas besoin de cookies
  maxAge: 3600, // Cache plus court pour les webhooks
};

/**
 * Configuration CORS pour les API publiques
 */
export const publicApiCorsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // API publiques - plus permissif
    if (!origin) {
      return callback(null, true);
    }

    // Autoriser toutes les origines HTTPS en production
    if (process.env.NODE_ENV === 'production' && origin.startsWith('https://')) {
      return callback(null, true);
    }

    // En développement, autoriser localhost
    if (process.env.NODE_ENV === 'development') {
      const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin);
      if (isLocalhost) {
        return callback(null, true);
      }
    }

    // Autoriser les domaines spécifiés
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://crealith.com',
      'https://www.crealith.com',
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS for public API'), false);
  },

  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
  ],
  credentials: false, // Pas de cookies pour les API publiques
  maxAge: 3600,
};

/**
 * Middleware CORS personnalisé avec logging
 */
export const corsWithLogging = (options: cors.CorsOptions) => {
  return (req: Request, res: any, next: any) => {
    const origin = req.get('Origin');
    const userAgent = req.get('User-Agent');
    
    // Log des requêtes CORS
    SecureLogger.debug('CORS request', {
      origin,
      method: req.method,
      path: req.path,
      userAgent: userAgent?.substring(0, 100),
    });

    // Appliquer CORS
    cors(options)(req, res, next);
  };
};

/**
 * Middleware pour gérer les erreurs CORS
 */
export const corsErrorHandler = (err: Error, req: Request, res: any, next: any) => {
  if (err.message.includes('CORS')) {
    const origin = req.get('Origin');
    const userAgent = req.get('User-Agent');
    
    SecureLogger.security('CORS error', req.ip || 'unknown', userAgent || 'unknown', {
      origin,
      method: req.method,
      path: req.path,
      error: err.message,
    });

    res.status(403).json({
      error: 'CORS Error',
      message: 'Access denied due to CORS policy',
      origin: origin || 'unknown',
      timestamp: new Date().toISOString(),
    });
  } else {
    next(err);
  }
};

/**
 * Configuration CORS par défaut
 */
export const defaultCors = cors(corsOptions);

/**
 * Configuration CORS pour les webhooks
 */
export const webhookCors = cors(webhookCorsOptions);

/**
 * Configuration CORS pour les API publiques
 */
export const publicApiCors = cors(publicApiCorsOptions);

/**
 * Fonction utilitaire pour créer une configuration CORS personnalisée
 */
export const createCustomCors = (customOptions: Partial<cors.CorsOptions>): cors.CorsOptions => {
  return {
    ...corsOptions,
    ...customOptions,
  };
};

/**
 * Middleware pour ajouter des headers de sécurité CORS
 */
export const corsSecurityHeaders = (req: Request, res: any, next: any) => {
  // Ajouter des headers de sécurité supplémentaires
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Headers spécifiques aux API
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-Response-Time', Date.now().toString());
  
  next();
};

export default {
  corsOptions,
  webhookCorsOptions,
  publicApiCorsOptions,
  defaultCors,
  webhookCors,
  publicApiCors,
  corsWithLogging,
  corsErrorHandler,
  createCustomCors,
  corsSecurityHeaders,
};
