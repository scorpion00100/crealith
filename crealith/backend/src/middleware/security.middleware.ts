import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { createError } from '../utils/errors';

// Rate limiting pour l'authentification
export const authRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 tentatives par minute
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Rate limiting pour l'inscription
export const registerRateLimit = process.env.NODE_ENV === 'test' ? ((req: Request, res: Response, next: NextFunction) => next()) as any : rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 inscriptions par IP par heure
  message: {
    success: false,
    message: 'Trop d\'inscriptions. Veuillez réessayer dans 1 heure.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting pour la réinitialisation de mot de passe
export const passwordResetRateLimit = process.env.NODE_ENV === 'test' ? ((req: Request, res: Response, next: NextFunction) => next()) as any : rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 demandes par IP par heure
  message: {
    success: false,
    message: 'Trop de demandes de réinitialisation. Veuillez réessayer dans 1 heure.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting pour la vérification d'email
export const emailVerificationRateLimit = process.env.NODE_ENV === 'test' ? ((req: Request, res: Response, next: NextFunction) => next()) as any : rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // 5 demandes par IP par heure
  message: {
    success: false,
    message: 'Trop de demandes de vérification. Veuillez réessayer dans 1 heure.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for Google OAuth init to prevent abuse
export const googleAuthRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many Google auth attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware pour valider les URLs de redirection
export const validateRedirectUrl = (req: Request, res: Response, next: NextFunction) => {
  const rawQueryRedirect = req.query.redirect as string | undefined;
  const rawBodyRedirect = (req.body && (req.body.redirect as string)) || undefined;
  // Certains providers (Google) renvoient un param state que nous réutilisons pour rediriger
  const rawStateRedirect = (req.query && (req.query.state as string)) || undefined;

  const candidate = rawQueryRedirect || rawBodyRedirect || rawStateRedirect;

  if (candidate) {
    // Domaines autorisés: FRONTEND_URL + liste via env (séparée par des virgules)
    const envAllowed = (process.env.ALLOWED_REDIRECT_ORIGINS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const allowedDomains = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'https://crealith.com',
      'https://www.crealith.com',
      ...envAllowed
    ];

    try {
      const url = new URL(candidate);

      // En production, n'autoriser que HTTPS
      if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
        throw createError.badRequest('Insecure redirect URL');
      }

      const isAllowed = allowedDomains.some(domain => {
        const domainUrl = new URL(domain);
        return url.origin === domainUrl.origin;
      });

      if (!isAllowed) {
        throw createError.badRequest('Invalid redirect URL');
      }
    } catch (error) {
      throw createError.badRequest('Invalid redirect URL format');
    }
  }

  next();
};

// Middleware pour valider les tokens CSRF (optionnel, pour les formulaires)
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Pour les requêtes POST, PUT, DELETE, PATCH
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const csrfToken = req.headers['x-csrf-token'] as string;
    
    // Pour l'instant, on skip la validation CSRF car nous n'avons pas de sessions configurées
    // En production, implémenter avec Redis ou sessions
    if (!csrfToken) {
      console.warn('CSRF token missing - skipping validation in development');
    }
  }
  
  next();
};

// Middleware pour générer un token CSRF
export const generateCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  // Générer un token CSRF simple pour le développement
  const csrfToken = require('crypto').randomBytes(32).toString('hex');
  res.locals.csrfToken = csrfToken;
  next();
};

// Middleware pour valider les headers de sécurité
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Headers de sécurité
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // CSP (Content Security Policy) basique
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https:; " +
    "frame-ancestors 'none';"
  );
  
  next();
};

// Middleware pour auditer les tentatives d'authentification
export const auditAuthAttempts = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Logger les tentatives d'authentification
    if (req.path.includes('/auth/')) {
      const logData = {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        success: res.statusCode < 400,
        statusCode: res.statusCode
      };
      
      console.log('Auth attempt:', JSON.stringify(logData));
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};
