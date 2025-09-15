import { Request, Response, NextFunction } from 'express';
import { SecureLogger } from './secure-logger';

/**
 * Interface pour les métriques
 */
export interface Metrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    byMethod: Record<string, number>;
    byRoute: Record<string, number>;
    byStatus: Record<number, number>;
  };
  performance: {
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  errors: {
    total: number;
    byType: Record<string, number>;
    byRoute: Record<string, number>;
  };
  system: {
    memoryUsage: NodeJS.MemoryUsage;
    uptime: number;
    cpuUsage: NodeJS.CpuUsage;
  };
  timestamp: string;
}

/**
 * Gestionnaire de métriques
 */
export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Metrics;
  private responseTimes: number[] = [];
  private startTime: number;

  private constructor() {
    this.startTime = Date.now();
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byMethod: {},
        byRoute: {},
        byStatus: {},
      },
      performance: {
        averageResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
      },
      errors: {
        total: 0,
        byType: {},
        byRoute: {},
      },
      system: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        cpuUsage: process.cpuUsage(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  /**
   * Enregistre une requête
   */
  recordRequest(req: Request, res: Response, responseTime: number): void {
    const method = req.method;
    const route = req.route?.path || req.path;
    const status = res.statusCode;

    // Métriques de requêtes
    this.metrics.requests.total++;
    this.metrics.requests.byMethod[method] = (this.metrics.requests.byMethod[method] || 0) + 1;
    this.metrics.requests.byRoute[route] = (this.metrics.requests.byRoute[route] || 0) + 1;
    this.metrics.requests.byStatus[status] = (this.metrics.requests.byStatus[status] || 0) + 1;

    if (status >= 200 && status < 400) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }

    // Métriques de performance
    this.responseTimes.push(responseTime);
    this.updatePerformanceMetrics();

    // Mettre à jour les métriques système
    this.updateSystemMetrics();
  }

  /**
   * Enregistre une erreur
   */
  recordError(error: Error, route: string): void {
    this.metrics.errors.total++;
    
    const errorType = error.constructor.name;
    this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;
    this.metrics.errors.byRoute[route] = (this.metrics.errors.byRoute[route] || 0) + 1;

    SecureLogger.error('Error recorded in metrics', error, { route, errorType });
  }

  /**
   * Met à jour les métriques de performance
   */
  private updatePerformanceMetrics(): void {
    if (this.responseTimes.length === 0) return;

    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const len = sorted.length;

    this.metrics.performance.averageResponseTime = 
      this.responseTimes.reduce((a, b) => a + b, 0) / len;
    this.metrics.performance.minResponseTime = sorted[0];
    this.metrics.performance.maxResponseTime = sorted[len - 1];
    this.metrics.performance.p95ResponseTime = sorted[Math.floor(len * 0.95)];
    this.metrics.performance.p99ResponseTime = sorted[Math.floor(len * 0.99)];

    // Garder seulement les 1000 derniers temps de réponse
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
  }

  /**
   * Met à jour les métriques système
   */
  private updateSystemMetrics(): void {
    this.metrics.system.memoryUsage = process.memoryUsage();
    this.metrics.system.uptime = process.uptime();
    this.metrics.system.cpuUsage = process.cpuUsage();
    this.metrics.timestamp = new Date().toISOString();
  }

  /**
   * Obtient les métriques actuelles
   */
  getMetrics(): Metrics {
    this.updateSystemMetrics();
    return { ...this.metrics };
  }

  /**
   * Réinitialise les métriques
   */
  resetMetrics(): void {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byMethod: {},
        byRoute: {},
        byStatus: {},
      },
      performance: {
        averageResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
      },
      errors: {
        total: 0,
        byType: {},
        byRoute: {},
      },
      system: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        cpuUsage: process.cpuUsage(),
      },
      timestamp: new Date().toISOString(),
    };
    this.responseTimes = [];
    this.startTime = Date.now();
  }

  /**
   * Obtient les métriques de santé
   */
  getHealthMetrics(): {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    memoryUsage: number;
    errorRate: number;
    responseTime: number;
  } {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    const errorRate = this.metrics.requests.total > 0 
      ? (this.metrics.errors.total / this.metrics.requests.total) * 100 
      : 0;
    const avgResponseTime = this.metrics.performance.averageResponseTime;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (memoryUsagePercent > 90 || errorRate > 10 || avgResponseTime > 5000) {
      status = 'critical';
    } else if (memoryUsagePercent > 75 || errorRate > 5 || avgResponseTime > 2000) {
      status = 'warning';
    }

    return {
      status,
      uptime,
      memoryUsage: memoryUsagePercent,
      errorRate,
      responseTime: avgResponseTime,
    };
  }
}

// Instance singleton
export const metricsCollector = MetricsCollector.getInstance();

/**
 * Middleware de collecte de métriques
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Ajouter un ID de requête unique
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  (req as any).requestId = requestId;
  
  // Intercepter la fin de la réponse
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    metricsCollector.recordRequest(req, res, responseTime);
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware de gestion d'erreurs avec métriques
 */
export const errorMetricsMiddleware = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  const route = req.route?.path || req.path;
  metricsCollector.recordError(error, route);
  next(error);
};

/**
 * Fonction utilitaire pour obtenir les métriques
 */
export const getMetrics = (): Metrics => {
  return metricsCollector.getMetrics();
};

/**
 * Fonction utilitaire pour obtenir les métriques de santé
 */
export const getHealthMetrics = () => {
  return metricsCollector.getHealthMetrics();
};

/**
 * Fonction utilitaire pour réinitialiser les métriques
 */
export const resetMetrics = (): void => {
  metricsCollector.resetMetrics();
};

export default metricsCollector;
