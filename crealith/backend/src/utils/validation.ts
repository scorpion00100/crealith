import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { createError } from './errors';

/**
 * Middleware factory pour valider les requêtes avec Zod
 * @param schema - Le schéma Zod à utiliser pour la validation
 * @param target - Partie de la requête à valider ('body', 'query', 'params')
 */
export const validate = (
  schema: z.ZodSchema,
  target: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[target];
      schema.parse(data);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(createError.validation(messages));
      }
      next(error);
    }
  };
};

// ==================== Auth Schemas ====================

export const registerSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .min(5, 'Email trop court')
    .max(255, 'Email trop long')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Mot de passe trop long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  firstName: z.string()
    .min(2, 'Prénom trop court')
    .max(50, 'Prénom trop long')
    .trim(),
  lastName: z.string()
    .min(2, 'Nom trop court')
    .max(50, 'Nom trop long')
    .trim(),
  role: z.enum(['BUYER', 'SELLER']).optional().default('BUYER'),
});

export const loginSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Mot de passe requis'),
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .toLowerCase()
    .trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Token requis'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Mot de passe trop long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
});

export const verifyEmailSchema = z.object({
  token: z.string()
    .min(1, 'Token requis'),
});

// ==================== Product Schemas ====================

export const createProductSchema = z.object({
  title: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères')
    .trim(),
  description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(5000, 'La description ne peut pas dépasser 5000 caractères')
    .trim(),
  shortDescription: z.string()
    .max(500, 'La description courte ne peut pas dépasser 500 caractères')
    .optional(),
  price: z.number()
    .positive('Le prix doit être positif')
    .max(999999, 'Prix trop élevé')
    .multipleOf(0.01, 'Le prix doit avoir au maximum 2 décimales')
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number)),
  originalPrice: z.number()
    .positive('Le prix original doit être positif')
    .max(999999, 'Prix trop élevé')
    .optional()
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional()),
  categoryId: z.string()
    .min(1, 'ID de catégorie requis'),
  tags: z.array(z.string().trim())
    .max(10, 'Maximum 10 tags')
    .optional()
    .default([]),
  fileType: z.string()
    .min(1, 'Type de fichier requis'),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  pageSize: z.string().regex(/^\d+$/).transform(Number).optional(), // Alias pour limit
  categoryId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(), // Pour filtrer par vendeur
  search: z.string().max(200).optional(),
  minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
  sortBy: z.enum(['recent', 'price_asc', 'price_desc', 'popular', 'createdAt', 'price', 'downloadsCount']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(), // Direction du tri
  sortOrder: z.enum(['asc', 'desc']).optional(), // Alias pour sortDir
  isFeatured: z.string().transform(val => val === 'true').optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
});

// ==================== Order Schemas ====================

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'ID de produit requis'),
    quantity: z.number().int().positive().max(100, 'Quantité maximale dépassée'),
  })).min(1, 'Au moins un produit requis'),
  paymentMethod: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED']),
});

// ==================== Review Schemas ====================

export const createReviewSchema = z.object({
  productId: z.string().min(1, 'ID de produit requis'),
  rating: z.number()
    .int('La note doit être un entier')
    .min(1, 'La note minimale est 1')
    .max(5, 'La note maximale est 5'),
  comment: z.string()
    .min(10, 'Le commentaire doit contenir au moins 10 caractères')
    .max(2000, 'Le commentaire ne peut pas dépasser 2000 caractères')
    .trim()
    .optional(),
});

export const updateReviewSchema = createReviewSchema.omit({ productId: true }).partial();

// ==================== Search Schemas ====================

export const searchQuerySchema = z.object({
  q: z.string()
    .min(1, 'Terme de recherche requis')
    .max(200, 'Terme de recherche trop long')
    .trim(),
  category: z.string().optional(),
  minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).transform(Number).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// ==================== Cart Schemas ====================

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'ID de produit requis'),
  quantity: z.preprocess(
    (val) => {
      if (typeof val === 'string') return parseInt(val, 10);
      if (val === undefined || val === null) return 1;
      return val;
    },
    z.number()
      .int('La quantité doit être un entier')
      .positive('La quantité doit être positive')
      .max(100, 'Quantité maximale: 100')
  ).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.preprocess(
    (val) => {
      if (typeof val === 'string') return parseInt(val, 10);
      return val;
    },
    z.number()
      .int('La quantité doit être un entier')
      .min(0, 'La quantité ne peut pas être négative')
      .max(100, 'Quantité maximale: 100')
  ),
});

// ==================== User Profile Schemas ====================

export const updateProfileSchema = z.object({
  firstName: z.string()
    .min(2, 'Prénom trop court')
    .max(50, 'Prénom trop long')
    .trim()
    .optional(),
  lastName: z.string()
    .min(2, 'Nom trop court')
    .max(50, 'Nom trop long')
    .trim()
    .optional(),
  bio: z.string()
    .max(1000, 'Bio trop longue')
    .trim()
    .optional(),
  avatar: z.string()
    .url('URL d\'avatar invalide')
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Mot de passe actuel requis'),
  newPassword: z.string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Mot de passe trop long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
});

// ==================== ID Param Schemas ====================

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID requis'),
});

export const productIdParamSchema = z.object({
  productId: z.string().min(1, 'ID de produit requis'),
});

