import helmet from 'helmet';
import { Express } from 'express';
import { SecureLogger } from '../utils/secure-logger';

/**
 * Configuration de sécurité avec Helmet
 */
export const securityConfig = {
  // Configuration générale de Helmet
  helmet: helmet({
    // Désactiver X-Powered-By
    hidePoweredBy: true,
    
    // Protection XSS
    xssFilter: true,
    
    // Protection contre le sniffing de type de contenu
    noSniff: true,
    
    // Protection contre le clickjacking
    frameguard: {
      action: 'deny',
    },
    
    // Politique de référent
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    
    // Headers de sécurité supplémentaires
    crossOriginEmbedderPolicy: false, // Désactivé pour compatibilité
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
    
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Nécessaire pour certains frameworks
          'https://fonts.googleapis.com',
          'https://cdn.jsdelivr.net',
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Nécessaire pour certains cas
          'https://js.stripe.com',
          'https://checkout.stripe.com',
          'https://cdn.jsdelivr.net',
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
          'data:',
        ],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://ik.imagekit.io',
          'https://images.unsplash.com',
          'https://via.placeholder.com',
        ],
        connectSrc: [
          "'self'",
          'https://api.stripe.com',
          'https://api.imagekit.io',
          'wss:', // Pour les WebSockets
        ],
        frameSrc: [
          "'self'",
          'https://js.stripe.com',
          'https://hooks.stripe.com',
        ],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        manifestSrc: ["'self'"],
        workerSrc: ["'self'", 'blob:'],
        childSrc: ["'self'", 'blob:'],
        formAction: ["'self'"],
        baseUri: ["'self'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    
    // Headers HSTS (HTTP Strict Transport Security)
    hsts: {
      maxAge: 31536000, // 1 an
      includeSubDomains: true,
      preload: true,
    },
    
    // Désactiver la mise en cache pour les réponses sensibles
    // noCache: false, // Géré manuellement si nécessaire
    
    // Permissions Policy (anciennement Feature Policy)
    // permissionsPolicy: {
    //   camera: [],
    //   microphone: [],
    //   geolocation: [],
    //   payment: ["'self'"],
    //   usb: [],
    //   magnetometer: [],
    //   gyroscope: [],
    //   accelerometer: [],
    //   ambientLightSensor: [],
    //   autoplay: [],
    //   battery: [],
    //   displayCapture: [],
    //   documentDomain: [],
    //   encryptedMedia: [],
    //   executionWhileNotRendered: [],
    //   executionWhileOutOfViewport: [],
    //   fullscreen: ["'self'"],
    //   layoutAnimations: [],
    //   legacyImageFormats: [],
    //   midi: [],
    //   oversizedImages: [],
    //   pictureInPicture: [],
    //   publickeyCredentialsGet: [],
    //   syncXhr: [],
    //   unoptimizedImages: [],
    //   unsizedMedia: [],
    //   verticalScroll: [],
    //   webShare: [],
    //   xrSpatialTracking: [],
    // },
  }),

  // Configuration pour les API
  apiSecurity: helmet({
    hidePoweredBy: true,
    xssFilter: true,
    noSniff: true,
    frameguard: false, // Pas de frames pour les API
    referrerPolicy: {
      policy: 'no-referrer',
    },
    contentSecurityPolicy: false, // Pas de CSP pour les API JSON
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),

  // Configuration pour les webhooks
  webhookSecurity: helmet({
    hidePoweredBy: true,
    xssFilter: true,
    noSniff: true,
    frameguard: false,
    referrerPolicy: {
      policy: 'no-referrer',
    },
    contentSecurityPolicy: false,
    hsts: false, // Pas de HSTS pour les webhooks
  }),
};

/**
 * Middleware de sécurité personnalisé
 */
export const customSecurityMiddleware = (req: any, res: any, next: any) => {
  // Ajouter des headers de sécurité personnalisés
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-Response-Time', Date.now().toString());
  res.setHeader('X-Request-ID', req.id || 'unknown');
  
  // Headers de sécurité supplémentaires
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Headers pour les API
  if (req.path.startsWith('/api/')) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }
  
  next();
};

/**
 * Middleware de sécurité pour les routes sensibles
 */
export const sensitiveRouteSecurity = (req: any, res: any, next: any) => {
  // Routes sensibles qui nécessitent une sécurité renforcée
  const sensitiveRoutes = [
    '/api/auth',
    '/api/admin',
    '/api/webhooks',
    '/api/payments',
  ];
  
  const isSensitiveRoute = sensitiveRoutes.some(route => req.path.startsWith(route));
  
  if (isSensitiveRoute) {
    // Headers de sécurité renforcés
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Log des accès aux routes sensibles
    SecureLogger.security('Sensitive route access', req.ip || 'unknown', req.get('User-Agent') || 'unknown', {
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent')?.substring(0, 100),
      ip: req.ip,
      forwardedFor: req.get('X-Forwarded-For'),
    });
  }
  
  next();
};

/**
 * Middleware de protection contre les attaques par déni de service
 */
export const dosProtection = (req: any, res: any, next: any) => {
  // Vérifier la taille du payload
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    SecureLogger.security('Large payload detected', req.ip || 'unknown', req.get('User-Agent') || 'unknown', {
      contentLength,
      maxSize,
      path: req.path,
      method: req.method,
    });
    
    return res.status(413).json({
      error: 'Payload Too Large',
      message: 'Request payload exceeds maximum allowed size',
      maxSize: maxSize,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Vérifier le nombre de headers
  const headerCount = Object.keys(req.headers).length;
  const maxHeaders = 50;
  
  if (headerCount > maxHeaders) {
    SecureLogger.security('Too many headers', req.ip || 'unknown', req.get('User-Agent') || 'unknown', {
      headerCount,
      maxHeaders,
      path: req.path,
      method: req.method,
    });
    
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Too many headers in request',
      maxHeaders: maxHeaders,
      timestamp: new Date().toISOString(),
    });
  }
  
  next();
};

/**
 * Middleware de protection contre les attaques par injection
 */
export const injectionProtection = (req: any, res: any, next: any) => {
  // Patterns d'injection courants
  const injectionPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /<link[^>]*>.*?<\/link>/gi,
    /<meta[^>]*>.*?<\/meta>/gi,
    /<style[^>]*>.*?<\/style>/gi,
    /<form[^>]*>.*?<\/form>/gi,
    /<input[^>]*>.*?<\/input>/gi,
    /<textarea[^>]*>.*?<\/textarea>/gi,
    /<select[^>]*>.*?<\/select>/gi,
    /<option[^>]*>.*?<\/option>/gi,
    /<button[^>]*>.*?<\/button>/gi,
    /<a[^>]*>.*?<\/a>/gi,
    /<img[^>]*>.*?<\/img>/gi,
    /<video[^>]*>.*?<\/video>/gi,
    /<audio[^>]*>.*?<\/audio>/gi,
    /<source[^>]*>.*?<\/source>/gi,
    /<track[^>]*>.*?<\/track>/gi,
    /<canvas[^>]*>.*?<\/canvas>/gi,
    /<svg[^>]*>.*?<\/svg>/gi,
    /<math[^>]*>.*?<\/math>/gi,
    /<table[^>]*>.*?<\/table>/gi,
    /<tr[^>]*>.*?<\/tr>/gi,
    /<td[^>]*>.*?<\/td>/gi,
    /<th[^>]*>.*?<\/th>/gi,
    /<thead[^>]*>.*?<\/thead>/gi,
    /<tbody[^>]*>.*?<\/tbody>/gi,
    /<tfoot[^>]*>.*?<\/tfoot>/gi,
    /<col[^>]*>.*?<\/col>/gi,
    /<colgroup[^>]*>.*?<\/colgroup>/gi,
    /<caption[^>]*>.*?<\/caption>/gi,
    /<fieldset[^>]*>.*?<\/fieldset>/gi,
    /<legend[^>]*>.*?<\/legend>/gi,
    /<label[^>]*>.*?<\/label>/gi,
    /<output[^>]*>.*?<\/output>/gi,
    /<progress[^>]*>.*?<\/progress>/gi,
    /<meter[^>]*>.*?<\/meter>/gi,
    /<details[^>]*>.*?<\/details>/gi,
    /<summary[^>]*>.*?<\/summary>/gi,
    /<dialog[^>]*>.*?<\/dialog>/gi,
    /<menu[^>]*>.*?<\/menu>/gi,
    /<menuitem[^>]*>.*?<\/menuitem>/gi,
    /<command[^>]*>.*?<\/command>/gi,
    /<keygen[^>]*>.*?<\/keygen>/gi,
    /<isindex[^>]*>.*?<\/isindex>/gi,
    /<base[^>]*>.*?<\/base>/gi,
    /<basefont[^>]*>.*?<\/basefont>/gi,
    /<bgsound[^>]*>.*?<\/bgsound>/gi,
    /<blink[^>]*>.*?<\/blink>/gi,
    /<center[^>]*>.*?<\/center>/gi,
    /<dir[^>]*>.*?<\/dir>/gi,
    /<font[^>]*>.*?<\/font>/gi,
    /<frame[^>]*>.*?<\/frame>/gi,
    /<frameset[^>]*>.*?<\/frameset>/gi,
    /<noframes[^>]*>.*?<\/noframes>/gi,
    /<marquee[^>]*>.*?<\/marquee>/gi,
    /<multicol[^>]*>.*?<\/multicol>/gi,
    /<nobr[^>]*>.*?<\/nobr>/gi,
    /<noembed[^>]*>.*?<\/noembed>/gi,
    /<nolayer[^>]*>.*?<\/nolayer>/gi,
    /<noscript[^>]*>.*?<\/noscript>/gi,
    /<plaintext[^>]*>.*?<\/plaintext>/gi,
    /<spacer[^>]*>.*?<\/spacer>/gi,
    /<strike[^>]*>.*?<\/strike>/gi,
    /<tt[^>]*>.*?<\/tt>/gi,
    /<u[^>]*>.*?<\/u>/gi,
    /<wbr[^>]*>.*?<\/wbr>/gi,
    /<xmp[^>]*>.*?<\/xmp>/gi,
  ];
  
  // Vérifier le body de la requête
  if (req.body && typeof req.body === 'object') {
    const bodyString = JSON.stringify(req.body);
    
    for (const pattern of injectionPatterns) {
      if (pattern.test(bodyString)) {
        SecureLogger.security('Injection attempt detected', req.ip || 'unknown', req.get('User-Agent') || 'unknown', {
          pattern: pattern.toString(),
          path: req.path,
          method: req.method,
          body: bodyString.substring(0, 500),
        });
        
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Potentially malicious content detected',
          timestamp: new Date().toISOString(),
        });
      }
    }
  }
  
  // Vérifier les paramètres de requête
  const queryString = JSON.stringify(req.query);
  for (const pattern of injectionPatterns) {
    if (pattern.test(queryString)) {
      SecureLogger.security('Injection attempt in query params', req.ip || 'unknown', req.get('User-Agent') || 'unknown', {
        pattern: pattern.toString(),
        path: req.path,
        method: req.method,
        query: queryString.substring(0, 500),
      });
      
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Potentially malicious content in query parameters',
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  next();
};

/**
 * Configuration de sécurité complète
 */
export const setupSecurity = (app: Express): void => {
  // Appliquer Helmet avec configuration générale
  app.use(securityConfig.helmet);
  
  // Middleware de sécurité personnalisé
  app.use(customSecurityMiddleware);
  
  // Protection contre les attaques par déni de service
  app.use(dosProtection);
  
  // Protection contre les injections
  app.use(injectionProtection);
  
  // Sécurité pour les routes sensibles
  app.use(sensitiveRouteSecurity);
  
  SecureLogger.info('Security middleware configured', {
    helmet: true,
    customSecurity: true,
    dosProtection: true,
    injectionProtection: true,
    sensitiveRouteSecurity: true,
  });
};

export default {
  securityConfig,
  customSecurityMiddleware,
  sensitiveRouteSecurity,
  dosProtection,
  injectionProtection,
  setupSecurity,
};
