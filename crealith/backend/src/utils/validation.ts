import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { createError } from './errors';

/**
 * Fabrique de middleware Express pour valider une partie de la requête avec un schéma Zod.
 * Valide `req[target]` puis passe au middleware suivant, sinon remonte une erreur de validation normalisée.
 * @param schema Le schéma Zod à utiliser pour la validation
 * @param target Partie de la requête à valider: 'body' | 'query' | 'params'
 * @returns Middleware Express de validation
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

/**
 * Schéma d'inscription utilisateur.
 * Contrainte sur email, mot de passe robuste et informations de profil de base.
 */
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

/**
 * Schéma de connexion: email + mot de passe minimal.
 */
export const loginSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Mot de passe requis'),
});

/**
 * Schéma demande de réinitialisation: email valide requis.
 */
export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .toLowerCase()
    .trim(),
});

/**
 * Schéma de réinitialisation du mot de passe via token + nouveau mot de passe robuste.
 */
export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Token requis'),
  newPassword: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Mot de passe trop long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
});

/**
 * Schéma de vérification d'email via token.
 */
export const verifyEmailSchema = z.object({
  token: z.string()
    .min(1, 'Token requis'),
});

// ==================== Product Schemas ====================

/**
 * Schéma de création de produit.
 * Gère la validation stricte des textes, prix (2 décimales) et options de visibilité.
 */
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
    .min(1, 'Type de fichier requis')
    .optional(),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schéma de mise à jour de produit (tous champs optionnels).
 */
export const updateProductSchema = createProductSchema.partial();

/**
 * Schéma de query produit pour pagination/tri/filtrage.
 * Convertit les valeurs string en Number/boolean si nécessaire.
 */
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

/**
 * Schéma de création de commande: items (+quantité), et option de paiement.
 */
export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'ID de produit requis'),
    quantity: z.number().int().positive().max(100, 'Quantité maximale dépassée'),
  })).min(1, 'Au moins un produit requis'),
  paymentMethod: z.string().optional(),
});

/**
 * Schéma de mise à jour du statut de commande.
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED']),
});

// ==================== Review Schemas ====================

/**
 * Schéma de création d'avis (note entière 1..5, commentaire optionnel).
 */
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

/**
 * Schéma de mise à jour d'avis (sans productId, champs optionnels).
 */
export const updateReviewSchema = createReviewSchema.omit({ productId: true }).partial();

// ==================== Search Schemas ====================

/**
 * Schéma de recherche: terme requis, filtres optionnels et pagination.
 */
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

/**
 * Schéma d'ajout au panier avec prétraitement de la quantité (string -> int) et valeur par défaut 1.
 */
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

/**
 * Schéma de mise à jour d'un item de panier (quantité entière >= 0).
 */
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

/**
 * Schéma de mise à jour de profil: noms, bio, avatar.
 */
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
    .nullable()
    .optional(),
  avatar: z.string()
    .url('URL d\'avatar invalide')
    .optional(),
});

/**
 * Schéma de changement de mot de passe: actuel + nouveau robuste.
 */
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

/**
 * Schéma de paramètre d'ID générique.
 */
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID requis'),
});

/**
 * Schéma de paramètre `productId`.
 */
export const productIdParamSchema = z.object({
  productId: z.string().min(1, 'ID de produit requis'),
});

// ==================== Order Schemas ====================

/**
 * Schéma de validation pour l'annulation de commande
 */
export const cancelOrderSchema = z.object({
  reason: z.string()
    .min(3, 'Reason must be at least 3 characters')
    .max(500, 'Reason must be at most 500 characters')
    .optional(),
});

