import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
// Swagger is lazily loaded based on env flags to speed up startup
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import routes from './routes';
import cookieParser from 'cookie-parser';
import healthRoutes from './routes/health.routes';
import { errorHandler } from './middleware/error.middleware';
import { correlationIdMiddleware, requestLoggingMiddleware, securityAuditMiddleware, dataChangeAuditMiddleware } from './middleware/audit.middleware';
import { sanitizeInput } from './middleware/validation.middleware';
// Avoid importing swagger config at startup
import { logger } from './utils/logger';
import passport from './config/passport';

dotenv.config();

export const prisma = new PrismaClient();
const app = express();

// Fast-start flags
const IS_TEST = process.env.NODE_ENV === 'test';
const DISABLE_RATE_LIMIT = process.env.DISABLE_RATE_LIMIT === '1' || process.env.FAST_START === '1';
const DISABLE_AUDIT = process.env.DISABLE_AUDIT === '1' || process.env.FAST_START === '1';
const DISABLE_SWAGGER = process.env.DISABLE_SWAGGER === '1' || process.env.FAST_START === '1';

// Middlewares de sécurité
app.use(helmet({ 
  crossOriginEmbedderPolicy: false, 
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'X-CSRF-Token']
}));

// Rate limiting
if (!DISABLE_RATE_LIMIT) {
  app.use(IS_TEST ? ((req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => next()) : rateLimit({ 
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limite par IP
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  }));
}

// Middlewares de base
// Parser robuste pour JSON (gère Buffer, string, ou JSON standard)
const jsonTypes = ['application/json', 'application/*+json'];
app.use(express.raw({ type: jsonTypes, limit: '50mb' }));
app.use((req, res, next) => {
  const contentType = (req.headers['content-type'] || '').toString();
  if (!jsonTypes.some(t => contentType.includes(t))) return next();
  if (Buffer.isBuffer(req.body)) {
    try {
      const text = req.body.length ? req.body.toString('utf8') : '';
      req.body = text ? JSON.parse(text) : {};
    } catch {
      // Laisser express.json gérer ensuite
    }
  } else if (typeof req.body === 'string') {
    try {
      req.body = req.body.length ? JSON.parse(req.body) : {};
    } catch {
      // Laisser express.json gérer ensuite
    }
  }
  return next();
});
// Support natif JSON pour les clients standards
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(compression());
// Cookies (pour refresh token HttpOnly et CSRF)
app.use(cookieParser());
// Passport (no sessions, stateless JWT)
app.use(passport.initialize());

// Middlewares d'audit et de logging (peuvent être désactivés pour FAST_START)
if (!DISABLE_AUDIT) {
  app.use(correlationIdMiddleware);
  app.use(requestLoggingMiddleware);
  app.use(securityAuditMiddleware);
  app.use(dataChangeAuditMiddleware);
}

// Sanitisation des inputs
app.use(sanitizeInput);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// Documentation API (lazy + option to disable)
if (!DISABLE_SWAGGER) {
  // Lazy import to avoid startup cost
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.use('/api-docs', async (req, res, next) => {
    try {
      const swaggerUi = await import('swagger-ui-express');
      const { swaggerSpec } = await import('./config/swagger.config');
      // Replace the handler on first hit
      const serve = swaggerUi.serve;
      const setup = swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Crealith API Documentation'
      });
      // Mount the real middleware chain
      // @ts-expect-error serve expects a router but works as middleware
      serve(req, res, () => setup(req, res, next));
    } catch (err) {
      next(err);
    }
  });
}

// Routes principales
app.use('/api', routes);

// Fichiers statiques pour les produits numériques uploadés (mock storage)
const uploadsDir = path.join(process.cwd(), 'crealith', 'backend', 'uploads');
app.use('/files', express.static(uploadsDir, {
  maxAge: '1y',
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

// Route 404
app.use('*', (req, res) => {
  logger.warn('404 Not Found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    correlationId: req.correlationId
  });
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found',
    correlationId: req.correlationId
  });
});

// Gestionnaire d'erreurs global
app.use(errorHandler);

export default app;
