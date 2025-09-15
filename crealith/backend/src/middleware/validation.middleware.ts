import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { createError } from '../utils/errors';
import { SecureLogger } from '../utils/secure-logger';

/**
 * Middleware de validation des erreurs
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined,
      location: (error as any).location,
    }));

    // Log des erreurs de validation
    SecureLogger.warn('Validation error', {
      path: req.path,
      method: req.method,
      errors: errorDetails,
      ip: req.ip,
      userAgent: req.get('User-Agent')?.substring(0, 100),
    });

    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errorDetails,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  next();
};

/**
 * Sanitisation des entrées
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitiser le body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitiser les paramètres de requête
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitiser les paramètres de route
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

/**
 * Fonction de sanitisation récursive
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeString(key)] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Sanitisation des chaînes de caractères
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') {
    return str;
  }
  
  return str
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Supprimer les caractères de contrôle
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .substring(0, 10000); // Limiter la longueur
}

/**
 * Validateurs personnalisés
 */
export const customValidators = {
  // Validation d'email avec vérification de domaine
  isValidEmail: (value: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }
    
    // Vérifier les domaines suspects
    const suspiciousDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
    const domain = value.split('@')[1]?.toLowerCase();
    if (suspiciousDomains.includes(domain)) {
      throw new Error('Temporary email addresses are not allowed');
    }
    
    return true;
  },

  // Validation de mot de passe robuste
  isValidPassword: (value: string) => {
    if (value.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    if (value.length > 128) {
      throw new Error('Password must be less than 128 characters');
    }
    
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
    
    if (!hasUpperCase) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    
    if (!hasLowerCase) {
      throw new Error('Password must contain at least one lowercase letter');
    }
    
    if (!hasNumbers) {
      throw new Error('Password must contain at least one number');
    }
    
    if (!hasSpecialChar) {
      throw new Error('Password must contain at least one special character');
    }
    
    // Vérifier les mots de passe communs
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    
    if (commonPasswords.includes(value.toLowerCase())) {
      throw new Error('Password is too common, please choose a stronger password');
    }
    
    return true;
  },

  // Validation de nom (prénom/nom)
  isValidName: (value: string) => {
    if (value.length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    
    if (value.length > 50) {
      throw new Error('Name must be less than 50 characters');
    }
    
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    if (!nameRegex.test(value)) {
      throw new Error('Name can only contain letters, spaces, hyphens, and apostrophes');
    }
    
    return true;
  },

  // Validation de numéro de téléphone
  isValidPhone: (value: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      throw new Error('Invalid phone number format');
    }
    
    return true;
  },

  // Validation d'URL
  isValidUrl: (value: string) => {
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('URL must use HTTP or HTTPS protocol');
      }
      return true;
    } catch {
      throw new Error('Invalid URL format');
    }
  },

  // Validation de prix
  isValidPrice: (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Price must be a valid number');
    }
    
    if (value < 0) {
      throw new Error('Price cannot be negative');
    }
    
    if (value > 1000000) {
      throw new Error('Price cannot exceed 1,000,000');
    }
    
    // Vérifier que le prix a au plus 2 décimales
    if (value % 0.01 !== 0) {
      throw new Error('Price can have at most 2 decimal places');
    }
    
    return true;
  },

  // Validation d'ID UUID
  isValidUUID: (value: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('Invalid UUID format');
    }
    return true;
  },

  // Validation de quantité
  isValidQuantity: (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Quantity must be a valid number');
    }
    
    if (!Number.isInteger(value)) {
      throw new Error('Quantity must be an integer');
    }
    
    if (value < 1) {
      throw new Error('Quantity must be at least 1');
    }
    
    if (value > 10000) {
      throw new Error('Quantity cannot exceed 10,000');
    }
    
    return true;
  },
};

/**
 * Validateurs pour les routes d'authentification
 */
export const authValidators = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .custom(customValidators.isValidEmail)
      .withMessage('Valid email is required'),
    
    body('password')
      .isLength({ min: 8, max: 128 })
      .custom(customValidators.isValidPassword)
      .withMessage('Password must be strong and secure'),
    
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .custom(customValidators.isValidName)
      .withMessage('Valid first name is required'),
    
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .custom(customValidators.isValidName)
      .withMessage('Valid last name is required'),
    
    body('phone')
      .optional()
      .custom(customValidators.isValidPhone)
      .withMessage('Valid phone number is required'),
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],

  forgotPassword: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
  ],

  resetPassword: [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    
    body('password')
      .isLength({ min: 8, max: 128 })
      .custom(customValidators.isValidPassword)
      .withMessage('Password must be strong and secure'),
  ],
};

/**
 * Validateurs pour les produits
 */
export const productValidators = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Product name must be between 3 and 100 characters'),
    
    body('description')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Product description must be between 10 and 2000 characters'),
    
    body('price')
      .isNumeric()
      .custom(customValidators.isValidPrice)
      .withMessage('Valid price is required'),
    
    body('categoryId')
      .isUUID()
      .withMessage('Valid category ID is required'),
    
    body('stock')
      .isInt({ min: 0, max: 10000 })
      .withMessage('Stock must be between 0 and 10,000'),
    
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Product name must be between 3 and 100 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Product description must be between 10 and 2000 characters'),
    
    body('price')
      .optional()
      .isNumeric()
      .custom(customValidators.isValidPrice)
      .withMessage('Valid price is required'),
    
    body('stock')
      .optional()
      .isInt({ min: 0, max: 10000 })
      .withMessage('Stock must be between 0 and 10,000'),
    
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ],

  getById: [
    param('id')
      .isUUID()
      .withMessage('Valid product ID is required'),
  ],
};

/**
 * Validateurs pour les commandes
 */
export const orderValidators = {
  create: [
    body('items')
      .isArray({ min: 1 })
      .withMessage('At least one item is required'),
    
    body('items.*.productId')
      .isUUID()
      .withMessage('Valid product ID is required'),
    
    body('items.*.quantity')
      .isInt({ min: 1, max: 100 })
      .withMessage('Quantity must be between 1 and 100'),
    
    body('items.*.price')
      .isNumeric()
      .custom(customValidators.isValidPrice)
      .withMessage('Valid price is required'),
    
    body('shippingAddress.street')
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('Street address is required'),
    
    body('shippingAddress.city')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('City is required'),
    
    body('shippingAddress.state')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('State is required'),
    
    body('shippingAddress.zipCode')
      .trim()
      .isLength({ min: 3, max: 10 })
      .withMessage('Valid zip code is required'),
    
    body('shippingAddress.country')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Country is required'),
  ],

  getById: [
    param('id')
      .isUUID()
      .withMessage('Valid order ID is required'),
  ],

  updateStatus: [
    param('id')
      .isUUID()
      .withMessage('Valid order ID is required'),
    
    body('status')
      .isIn(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
      .withMessage('Valid status is required'),
  ],
};

/**
 * Validateurs pour les avis
 */
export const reviewValidators = {
  create: [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    
    body('comment')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Comment must be between 10 and 1000 characters'),
  ],
};

/**
 * Validateurs pour les paramètres de requête
 */
export const queryValidators = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Page must be between 1 and 1000'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],

  search: [
    query('search')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search term must be between 2 and 100 characters'),
  ],

  filters: [
    query('categoryId')
      .optional()
      .isUUID()
      .withMessage('Valid category ID is required'),
    
    query('minPrice')
      .optional()
      .isNumeric()
      .custom(customValidators.isValidPrice)
      .withMessage('Valid minimum price is required'),
    
    query('maxPrice')
      .optional()
      .isNumeric()
      .custom(customValidators.isValidPrice)
      .withMessage('Valid maximum price is required'),
    
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ],
};

/**
 * Middleware de validation pour les fichiers uploadés
 */
export const validateFileUpload = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.file && !req.files) {
    return next();
  }
  
  const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];
  
  for (const file of files) {
    if (!file) continue;
    
    // Vérifier la taille du fichier
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      res.status(400).json({
        error: 'File Too Large',
        message: `File ${file.originalname} exceeds maximum size of 10MB`,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    // Vérifier le type MIME
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
      res.status(400).json({
        error: 'Invalid File Type',
        message: `File type ${file.mimetype} is not allowed`,
        allowedTypes,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    // Vérifier l'extension du fichier
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.zip'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      res.status(400).json({
        error: 'Invalid File Extension',
        message: `File extension ${fileExtension} is not allowed`,
        allowedExtensions,
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }
  
  next();
};

export default {
  validateRequest,
  sanitizeInput,
  customValidators,
  authValidators,
  productValidators,
  orderValidators,
  reviewValidators,
  queryValidators,
  validateFileUpload,
};