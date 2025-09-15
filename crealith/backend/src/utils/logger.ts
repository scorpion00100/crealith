import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

// Format personnalisé pour les logs structurés
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };
    return JSON.stringify(logEntry);
  })
);

// Format pour le développement (plus lisible)
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return log;
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? logFormat : devFormat,
  defaultMeta: {
    service: 'crealith-api',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Fichier d'erreurs
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    // Fichier de logs combinés
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    // Console pour le développement
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        level: 'debug'
      })
    ] : [])
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

// Fonction pour créer un logger avec un correlation ID
export const createLoggerWithCorrelation = (correlationId?: string) => {
  const id = correlationId || uuidv4();
  return logger.child({ correlationId: id });
};

// Fonction pour logger les requêtes HTTP
export const logRequest = (req: any, res: any, responseTime: number) => {
  const logData = {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.userId,
    correlationId: req.correlationId
  };

  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

// Fonction pour logger les erreurs avec contexte
export const logError = (error: Error, context: any = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...context
  });
};

// Fonction pour logger les événements métier
export const logBusinessEvent = (event: string, data: any = {}) => {
  logger.info('Business Event', {
    event,
    ...data
  });
};

// Fonction pour logger les performances
export const logPerformance = (operation: string, duration: number, metadata: any = {}) => {
  logger.info('Performance', {
    operation,
    duration: `${duration}ms`,
    ...metadata
  });
};

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
