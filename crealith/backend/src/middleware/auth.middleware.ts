import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { createError } from '../utils/errors';
import prisma from '../prisma';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw createError.unauthorized('Access token required');
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(createError.unauthorized('Invalid access token'));
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError.forbidden('Insufficient permissions'));
    }

    next();
  };
};

export const requireAuth = authenticateToken;
export const requireBuyer = requireRole(['BUYER', 'SELLER', 'ADMIN']);
export const requireSeller = requireRole(['SELLER', 'ADMIN']);
export const requireAdmin = requireRole(['ADMIN']);

// Middleware pour vérifier la propriété (seul le propriétaire peut modifier)
export const requireOwnership = (resourceType: 'product' | 'order' | 'review') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentification requise' 
      });
    }

    const resourceId = req.params.id;
    let resource;

    try {
      switch (resourceType) {
        case 'product':
          resource = await prisma.product.findUnique({
            where: { id: resourceId },
            select: { userId: true }
          });
          break;
        case 'order':
          resource = await prisma.order.findUnique({
            where: { id: resourceId },
            select: { userId: true }
          });
          break;
        case 'review':
          resource = await prisma.review.findUnique({
            where: { id: resourceId },
            select: { userId: true }
          });
          break;
      }

      if (!resource) {
        return res.status(404).json({ 
          success: false, 
          message: 'Ressource non trouvée' 
        });
      }

      // Admin peut tout modifier
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // Vérifier la propriété
      if (resource.userId !== req.user.userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Accès non autorisé' 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la vérification des permissions' 
      });
    }
  };
};

// Middleware pour vérifier que l'utilisateur a acheté le produit (pour les reviews)
export const requirePurchase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentification requise' 
    });
  }

  const productId = req.params.productId || req.body.productId;

  try {
    const purchase = await prisma.order.findFirst({
      where: {
        userId: req.user.userId,
        status: 'PAID',
        items: {
          some: {
            productId: productId
          }
        }
      }
    });

    if (!purchase) {
      return res.status(403).json({ 
        success: false, 
        message: 'Vous devez avoir acheté ce produit pour le noter' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la vérification de l\'achat' 
    });
  }
};
