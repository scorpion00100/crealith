import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { redisService } from '../services/redis.service';
import { SecureLogger } from '../utils/secure-logger';

const prisma = new PrismaClient();

export class HealthController {
  /**
   * Health check simple - pour les load balancers
   */
  async liveness(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'crealith-api',
        version: process.env.npm_package_version || '1.0.0',
      });
    } catch (error) {
      SecureLogger.error('Liveness check failed', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable',
      });
    }
  }

  /**
   * Health check complet - pour le monitoring
   */
  async readiness(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const healthChecks = {
      database: { status: 'unknown', latency: 0, error: null as string | null },
      redis: { status: 'unknown', latency: 0, error: null as string | null },
      memory: { status: 'unknown', usage: 0, error: null as string | null },
      disk: { status: 'unknown', usage: 0, error: null as string | null },
    };

    let overallStatus = 'healthy';

    try {
      // Test de la base de données
      const dbStart = Date.now();
      try {
        await prisma.$queryRaw`SELECT 1`;
        healthChecks.database = {
          status: 'healthy',
          latency: Date.now() - dbStart,
          error: null,
        };
      } catch (error) {
        healthChecks.database = {
          status: 'unhealthy',
          latency: Date.now() - dbStart,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        overallStatus = 'unhealthy';
      }

      // Test de Redis
      const redisStart = Date.now();
      try {
        const redisHealth = await redisService.healthCheck();
        healthChecks.redis = {
          status: redisHealth.status,
          latency: redisHealth.latency,
          error: redisHealth.status === 'healthy' ? null : 'Redis connection failed',
        };
        if (redisHealth.status !== 'healthy') {
          overallStatus = 'unhealthy';
        }
      } catch (error) {
        healthChecks.redis = {
          status: 'unhealthy',
          latency: Date.now() - redisStart,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        overallStatus = 'unhealthy';
      }

      // Vérification de la mémoire
      try {
        const memUsage = process.memoryUsage();
        const memUsageMB = {
          rss: Math.round(memUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024),
        };

        const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        
        healthChecks.memory = {
          status: heapUsagePercent > 90 ? 'warning' : 'healthy',
          usage: heapUsagePercent,
          error: heapUsagePercent > 90 ? 'High memory usage' : null,
        };

        if (heapUsagePercent > 95) {
          overallStatus = 'unhealthy';
        }
      } catch (error) {
        healthChecks.memory = {
          status: 'unhealthy',
          usage: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        overallStatus = 'unhealthy';
      }

      // Vérification de l'espace disque (simplifiée)
      try {
        const fs = require('fs');
        const stats = fs.statSync('.');
        healthChecks.disk = {
          status: 'healthy',
          usage: 0, // Simplifié pour l'exemple
          error: null,
        };
      } catch (error) {
        healthChecks.disk = {
          status: 'unhealthy',
          usage: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        overallStatus = 'unhealthy';
      }

      const responseTime = Date.now() - startTime;

      const response = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'crealith-api',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        responseTime,
        checks: healthChecks,
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid,
        },
      };

      const statusCode = overallStatus === 'healthy' ? 200 : 503;
      res.status(statusCode).json(response);

      // Log du health check
      if (overallStatus !== 'healthy') {
        SecureLogger.warn('Health check failed', {
          status: overallStatus,
          checks: healthChecks,
          responseTime,
        });
      } else {
        SecureLogger.debug('Health check passed', {
          responseTime,
          checks: healthChecks,
        });
      }

    } catch (error) {
      SecureLogger.error('Health check error', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Health check détaillé - pour le debugging
   */
  async detailed(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Informations système détaillées
      const systemInfo = {
        node: {
          version: process.version,
          platform: process.platform,
          arch: process.arch,
          pid: process.pid,
          uptime: process.uptime(),
        },
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          PORT: process.env.PORT,
          DATABASE_URL: process.env.DATABASE_URL ? '***configured***' : 'not configured',
          REDIS_HOST: process.env.REDIS_HOST || 'not configured',
          STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? '***configured***' : 'not configured',
          IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY ? '***configured***' : 'not configured',
        },
      };

      // Test de connectivité des services externes
      const externalServices = {
        database: await this.testDatabase(),
        redis: await this.testRedis(),
        stripe: await this.testStripe(),
        imagekit: await this.testImageKit(),
      };

      const response = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        system: systemInfo,
        services: externalServices,
        metrics: {
          activeConnections: 0, // À implémenter si nécessaire
          requestCount: 0, // À implémenter si nécessaire
          errorRate: 0, // À implémenter si nécessaire
        },
      };

      res.status(200).json(response);

    } catch (error) {
      SecureLogger.error('Detailed health check failed', error);
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Test de la base de données
   */
  private async testDatabase(): Promise<any> {
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;

      // Test de performance
      const userCount = await prisma.user.count();
      const productCount = await prisma.product.count();
      const orderCount = await prisma.order.count();

      return {
        status: 'healthy',
        latency,
        metrics: {
          userCount,
          productCount,
          orderCount,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test de Redis
   */
  private async testRedis(): Promise<any> {
    try {
      const health = await redisService.healthCheck();
      const connectionInfo = await redisService.getConnectionInfo();
      
      return {
        status: health.status,
        latency: health.latency,
        connection: connectionInfo,
        memory: health.memory,
        uptime: health.uptime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test de Stripe
   */
  private async testStripe(): Promise<any> {
    try {
      // Test simple de la configuration Stripe
      const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;
      const hasPublishableKey = !!process.env.STRIPE_PUBLISHABLE_KEY;
      const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;

      return {
        status: hasSecretKey && hasPublishableKey ? 'healthy' : 'warning',
        configured: {
          secretKey: hasSecretKey,
          publishableKey: hasPublishableKey,
          webhookSecret: hasWebhookSecret,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test d'ImageKit
   */
  private async testImageKit(): Promise<any> {
    try {
      const hasPublicKey = !!process.env.IMAGEKIT_PUBLIC_KEY;
      const hasPrivateKey = !!process.env.IMAGEKIT_PRIVATE_KEY;
      const hasUrlEndpoint = !!process.env.IMAGEKIT_URL_ENDPOINT;

      return {
        status: hasPublicKey && hasPrivateKey && hasUrlEndpoint ? 'healthy' : 'warning',
        configured: {
          publicKey: hasPublicKey,
          privateKey: hasPrivateKey,
          urlEndpoint: hasUrlEndpoint,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Métriques de performance
   */
  async metrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        system: {
          loadAverage: require('os').loadavg(),
          freeMemory: require('os').freemem(),
          totalMemory: require('os').totalmem(),
        },
        database: await this.getDatabaseMetrics(),
        redis: await this.getRedisMetrics(),
      };

      res.status(200).json(metrics);
    } catch (error) {
      SecureLogger.error('Metrics collection failed', error);
      res.status(500).json({
        error: 'Failed to collect metrics',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Métriques de la base de données
   */
  private async getDatabaseMetrics(): Promise<any> {
    try {
      const [userCount, productCount, orderCount, categoryCount] = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.category.count(),
      ]);

      return {
        userCount,
        productCount,
        orderCount,
        categoryCount,
        status: 'healthy',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Métriques de Redis
   */
  private async getRedisMetrics(): Promise<any> {
    try {
      const stats = await redisService.getStats();
      return {
        ...stats,
        status: stats.connected ? 'healthy' : 'unhealthy',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}