import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../app';
import { createError } from '../utils/errors';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      throw createError.unauthorized('Access token required');
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, isActive: true },
      select: { id: true, email: true, role: true, firstName: true, lastName: true }
    });

    if (!user) {
      throw createError.unauthorized('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(createError.forbidden('Insufficient permissions'));
    }
    next();
  };
};

export const requireAuth = authenticateToken;
export const requireSeller = [authenticateToken, requireRole('SELLER', 'ADMIN')];
export const requireAdmin = [authenticateToken, requireRole('ADMIN')];
