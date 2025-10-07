import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import prisma from '../prisma'; // ✅ on réutilise le client Prisma

const authService = new AuthService();

export const register = async (req: Request, res: Response, next: NextFunction) => {
  /**
   * Inscription d'un utilisateur.
   * Valide et délègue à `AuthService.register`, retourne 201 avec l'utilisateur et tokens.
   */
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result, message: 'User registered successfully' });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  /**
   * Connexion d'un utilisateur.
   * Délègue à `AuthService.login`, retourne 200 avec user + tokens.
   */
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, data: result, message: 'Login successful' });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  /**
   * Récupère le profil de l'utilisateur courant.
   * Utilise Prisma pour renvoyer un sous-ensemble de champs sûrs.
   */
  try {
    const user = await prisma.user.findUnique({
              where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        bio: true
      }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
