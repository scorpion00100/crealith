import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger, logRequest, logBusinessEvent } from '../utils/logger';

// Étendre l'interface Request pour inclure correlationId
declare global {
  namespace Express {
    interface Request {
      correlationId: string;
      startTime: number;
    }
  }
}

/**
 * Middleware pour ajouter un correlation ID à chaque requête
 */
export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Utiliser le correlation ID du header ou en créer un nouveau
  req.correlationId = req.headers['x-correlation-id'] as string || uuidv4();
  
  // Ajouter le correlation ID à la réponse
  res.setHeader('X-Correlation-ID', req.correlationId);
  
  // Marquer le temps de début
  req.startTime = Date.now();
  
  next();
};

/**
 * Middleware pour logger les requêtes HTTP
 */
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Logger la requête entrante
  logger.info('Incoming Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    correlationId: req.correlationId,
    userId: req.user?.userId
  });

  // Intercepter la réponse pour logger le temps de traitement
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - req.startTime;
    logRequest(req, res, responseTime);
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Middleware pour logger les événements d'audit
 */
export const auditMiddleware = (event: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Logger l'événement d'audit
    logBusinessEvent(event, {
      method: req.method,
      url: req.url,
      userId: req.user?.userId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      correlationId: req.correlationId,
      body: sanitizeAuditData(req.body),
      params: req.params,
      query: req.query
    });

    next();
  };
};

/**
 * Sanitise les données sensibles pour l'audit
 */
function sanitizeAuditData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'accessToken',
    'refreshToken',
    'secret',
    'apiKey',
    'privateKey',
    'creditCard',
    'cvv',
    'ssn',
    'socialSecurityNumber'
  ];

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  // Sanitise les objets imbriqués
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeAuditData(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Middleware pour logger les erreurs avec contexte
 */
export const errorAuditMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Request Error', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    userId: req.user?.userId,
    ip: req.ip,
    correlationId: req.correlationId,
    body: sanitizeAuditData(req.body),
    params: req.params,
    query: req.query
  });

  next(error);
};

/**
 * Middleware pour logger les tentatives d'accès non autorisées
 */
export const securityAuditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Logger les tentatives d'accès sans authentification
  if (req.path.includes('/api/') && !req.user && req.method !== 'GET') {
    logger.warn('Unauthorized Access Attempt', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      correlationId: req.correlationId
    });
  }

  next();
};

/**
 * Middleware pour logger les changements de données sensibles
 */
export const dataChangeAuditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const sensitiveEndpoints = [
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/change-password',
    '/api/auth/reset-password',
    '/api/products',
    '/api/orders',
    '/api/users'
  ];

  const isSensitiveEndpoint = sensitiveEndpoints.some(endpoint => 
    req.path.startsWith(endpoint)
  );

  if (isSensitiveEndpoint && req.user) {
    logBusinessEvent('Data Change', {
      method: req.method,
      url: req.url,
      userId: req.user.userId,
      userRole: req.user.role,
      ip: req.ip,
      correlationId: req.correlationId,
      changes: sanitizeAuditData(req.body)
    });
  }

  next();
};
