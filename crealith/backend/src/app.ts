import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';

dotenv.config();

export const prisma = new PrismaClient();
const app = express();

app.use(helmet({ crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));
app.use(express.json({ limit: '50mb' }));
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Crealith API', timestamp: new Date().toISOString() });
});

app.use('/api', routes);
app.use('*', (req, res) => res.status(404).json({ success: false, message: 'Endpoint not found' }));
app.use(errorHandler);

export default app;
