import prisma from '../prisma';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getTokenInfo } from '../utils/jwt';
import { createError } from '../utils/errors';
import { redisService } from './redis.service';
import { emailService } from './email.service';
import crypto from 'crypto';

export class AuthService {
  async register(data: { email: string; password: string; firstName: string; lastName: string; role?: 'BUYER' | 'SELLER' }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw createError.conflict('User already exists');
    }

    const passwordHash = await hashPassword(data.password);
    const { password, ...userData } = data;
    
    // Générer un token de vérification d'email
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    const user = await prisma.user.create({
      data: { 
        ...userData, 
        passwordHash, 
        role: data.role || 'BUYER',
        emailVerified: false,
        emailVerificationToken,
        emailVerificationExpires
      },
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true, 
        role: true, 
        emailVerified: true,
        createdAt: true 
      }
    });

    // Envoyer l'email de vérification
    try {
      await emailService.sendVerificationEmail(user.email, emailVerificationToken, user.firstName);
    } catch (error) {
      console.error('Erreur envoi email de vérification:', error);
      // Ne pas faire échouer l'inscription si l'email ne peut pas être envoyé
    }

    return { 
      user, 
      message: 'Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.',
      requiresEmailVerification: true
    };
  }

  async googleLogin(data: { email: string; firstName: string; lastName: string; avatar?: string | null; googleId: string; accessToken?: string; refreshToken?: string }) {
    // Try find existing by googleId
    let user = await prisma.user.findFirst({ where: { googleId: data.googleId, isActive: true } });

    // If not found, try link by email
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: data.email } });

      if (user) {
        // Link Google to existing account
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: data.googleId,
            googleEmail: data.email,
            googleName: `${data.firstName} ${data.lastName}`.trim(),
            googleAvatar: data.avatar || user.avatar || null,
            googleAccessToken: data.accessToken,
            googleRefreshToken: data.refreshToken,
            // Ensure emailVerified is true if Google provided verified email
            emailVerified: true,
            // Optionally sync public profile fields
            firstName: user.firstName || data.firstName,
            lastName: user.lastName || data.lastName,
            avatar: user.avatar || data.avatar || null
          }
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: data.email,
            passwordHash: await hashPassword(require('crypto').randomBytes(16).toString('hex')), // random password placeholder
            firstName: data.firstName,
            lastName: data.lastName,
            role: 'BUYER',
            avatar: data.avatar || null,
            emailVerified: true,
            googleId: data.googleId,
            googleEmail: data.email,
            googleName: `${data.firstName} ${data.lastName}`.trim(),
            googleAvatar: data.avatar || null,
            googleAccessToken: data.accessToken,
            googleRefreshToken: data.refreshToken
          }
        });
      }
    } else {
      // Update tokens and profile sync
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleAccessToken: data.accessToken,
          googleRefreshToken: data.refreshToken,
          googleEmail: data.email,
          googleName: `${data.firstName} ${data.lastName}`.trim(),
          googleAvatar: data.avatar || user.avatar || null,
          avatar: user.avatar || data.avatar || null
        }
      });
    }

    // Issue tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
    await redisService.storeRefreshToken(refreshToken, user.id);

    const { passwordHash, ...userWithoutPassword } = user as any;
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      expiresIn: 15 * 60
    };
  }
  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: data.email, isActive: true } });
    if (!user || !await comparePassword(data.password, user.passwordHash)) {
      throw createError.unauthorized('Invalid credentials');
    }

    // Vérifier que l'email est vérifié
    if (!user.emailVerified) {
      throw createError.unauthorized('Email not verified. Please check your email and click the verification link.');
    }

    // Générer les tokens
    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    // Stocker le refresh token dans Redis
    await redisService.storeRefreshToken(refreshToken, user.id);

    const { passwordHash, ...userWithoutPassword } = user;
    return { 
      user: userWithoutPassword, 
      accessToken, 
      refreshToken,
      expiresIn: 15 * 60 // 15 minutes en secondes
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Vérifier le refresh token
      const payload = verifyRefreshToken(refreshToken);
      
      // Vérifier que le token existe dans Redis et est valide
      const tokenData = await redisService.getRefreshToken(refreshToken);
      if (!tokenData || tokenData.userId !== payload.userId) {
        throw createError.unauthorized('Invalid refresh token');
      }

      // Vérifier que le token n'a pas expiré
      const expiresAt = new Date(tokenData.expiresAt);
      if (expiresAt <= new Date()) {
        throw createError.unauthorized('Refresh token expired');
      }

      // Récupérer l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: payload.userId, isActive: true },
        select: { id: true, email: true, firstName: true, lastName: true, role: true }
      });

      if (!user) {
        throw createError.unauthorized('User not found');
      }

      // Générer de nouveaux tokens
      const newAccessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
      const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

      // Révoquer l'ancien refresh token
      await redisService.revokeRefreshToken(refreshToken);

      // Stocker le nouveau refresh token
      await redisService.storeRefreshToken(newRefreshToken, user.id);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 15 * 60 // 15 minutes en secondes
      };
    } catch (error) {
      throw createError.unauthorized('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    // Révoquer le refresh token dans Redis
    await redisService.revokeRefreshToken(refreshToken);
  }

  async logoutAll(userId: string) {
    // Révoquer tous les refresh tokens de l'utilisateur dans Redis
    await redisService.revokeAllUserTokens(userId);
  }

  async revokeToken(token: string) {
    await redisService.revokeRefreshToken(token);
  }

  async getActiveSessions(userId: string) {
    return await redisService.getActiveSessions(userId);
  }

  async getSessionInfo(token: string) {
    try {
      const tokenInfo = getTokenInfo(token);
      const tokenData = await redisService.getRefreshToken(token);

      return {
        ...tokenInfo,
        stored: tokenData,
        isValid: tokenData && new Date(tokenData.expiresAt) > new Date()
      };
    } catch (error) {
      return {
        type: 'unknown',
        expiresAt: null,
        stored: null,
        isValid: false
      };
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true }
    });

    if (!user || !await comparePassword(currentPassword, user.passwordHash)) {
      throw createError.unauthorized('Current password is incorrect');
    }

    const newPasswordHash = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    // Révoquer tous les refresh tokens pour forcer une nouvelle connexion
    await this.logoutAll(userId);

    return { message: 'Password changed successfully. Please login again.' };
  }


  async resetPassword(token: string, newPassword: string) {
    const resetTokenData = await redisService.getResetToken(token);

    if (!resetTokenData) {
      throw createError.badRequest('Invalid or expired reset token');
    }

    // Vérifier que le token n'a pas expiré
    const expiresAt = new Date(resetTokenData.expiresAt);
    if (expiresAt <= new Date()) {
      throw createError.badRequest('Reset token has expired');
    }

    const user = await prisma.user.findUnique({
      where: { email: resetTokenData.email, isActive: true }
    });

    if (!user) {
      throw createError.badRequest('User not found');
    }

    const newPasswordHash = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash }
    });

    // Révoquer le token de réinitialisation
    await redisService.revokeResetToken(token);

    // Révoquer tous les refresh tokens
    await this.logoutAll(user.id);

    return { message: 'Password reset successfully. Please login with your new password.' };
  }

  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        bio: true,
        stripeAccountId: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true,
            orders: true,
            reviews: true,
            favorites: true
          }
        }
      }
    });

    if (!user) {
      throw createError.notFound('User not found');
    }

    return user;
  }

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      throw createError.badRequest('Invalid or expired verification token');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw createError.notFound('User not found');
    }

    if (user.emailVerified) {
      throw createError.badRequest('Email already verified');
    }

    // Générer un nouveau token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationExpires
      }
    });

    // Envoyer l'email
    await emailService.sendVerificationEmail(user.email, emailVerificationToken, user.firstName);

    return { message: 'Verification email sent successfully' };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email, isActive: true } });
    if (!user) {
      // Ne pas révéler si l'email existe ou non
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes en timestamp

    // Stocker le token dans Redis
    await redisService.storeResetToken(resetToken, user.id, resetExpires);

    // Envoyer l'email
    await emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName);

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  // Méthodes utilitaires pour Redis
  async getRedisStats() {
    return await redisService.getStats();
  }

  async pingRedis() {
    return await redisService.ping();
  }

  async cleanupExpiredTokens() {
    return await redisService.cleanupExpiredTokens();
  }
}
