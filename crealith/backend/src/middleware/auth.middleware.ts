import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'BUYER' | 'SELLER' | 'ADMIN';
  };
}

// Middleware d'authentification
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token d\'accès requis' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Vérifier que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Utilisateur invalide ou désactivé' 
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Token invalide' 
    });
  }
};

// Middleware RBAC pour vérifier les rôles
export const requireRole = (roles: ('BUYER' | 'SELLER' | 'ADMIN')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentification requise' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Permissions insuffisantes' 
      });
    }

    next();
  };
};

// Middleware pour vérifier la propriété (seul le propriétaire peut modifier)
export const requireOwnership = (resourceType: 'product' | 'order' | 'review') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
      if (resource.userId !== req.user.id) {
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
  req: AuthenticatedRequest,
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
        userId: req.user.id,
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
