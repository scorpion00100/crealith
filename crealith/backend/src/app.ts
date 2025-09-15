import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import routes from './routes';
import healthRoutes from './routes/health.routes';
import { errorHandler } from './middleware/error.middleware';
import { correlationIdMiddleware, requestLoggingMiddleware, securityAuditMiddleware, dataChangeAuditMiddleware } from './middleware/audit.middleware';
import { sanitizeInput } from './middleware/validation.middleware';
import { swaggerSpec } from './config/swagger.config';
import { logger } from './utils/logger';
import passport from './config/passport';

dotenv.config();

export const prisma = new PrismaClient();
const app = express();

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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID']
}));

// Rate limiting
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limite par IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
}));

// Middlewares de base
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(compression());
// Passport (no sessions, stateless JWT)
app.use(passport.initialize());

// Middlewares d'audit et de logging
app.use(correlationIdMiddleware);
app.use(requestLoggingMiddleware);
app.use(securityAuditMiddleware);
app.use(dataChangeAuditMiddleware);

// Sanitisation des inputs
app.use(sanitizeInput);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// Documentation API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Crealith API Documentation'
}));

// Routes principales
app.use('/api', routes);

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
