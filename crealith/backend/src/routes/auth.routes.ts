import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { authenticateToken } from '../middleware/auth.middleware';
import { createError } from '../utils/errors';
import { 
  authRateLimit, 
  registerRateLimit, 
  passwordResetRateLimit, 
  emailVerificationRateLimit,
  validateRedirectUrl,
  auditAuthAttempts
} from '../middleware/security.middleware';
import passport from '../config/passport';
import { redisService } from '../services/redis.service';

const router = Router();
const authService = new AuthService();

// Route d'inscription
router.post('/register', registerRateLimit, auditAuthAttempts, async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      throw createError.badRequest('Missing required fields');
    }

    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Route de connexion
router.post('/login', authRateLimit, auditAuthAttempts, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw createError.badRequest('Email and password are required');
    }

    const result = await authService.login({ email, password });

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Route de refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw createError.badRequest('Refresh token is required');
    }

    const result = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Route de déconnexion
router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
});

// Route de déconnexion de tous les appareils
router.post('/logout-all', authenticateToken, async (req, res, next) => {
  try {
    if (!req.user) {
      throw createError.unauthorized('Authentication required');
    }

    await authService.logoutAll(req.user.userId);

    res.json({
      success: true,
      message: 'Logged out from all devices'
    });
  } catch (error) {
    next(error);
  }
});

// Route pour révoquer un token spécifique
router.post('/revoke-token', authenticateToken, async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      throw createError.badRequest('Token is required');
    }

    await authService.revokeToken(token);

    res.json({
      success: true,
      message: 'Token revoked successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir les sessions actives
router.get('/sessions', authenticateToken, async (req, res, next) => {
  try {
    if (!req.user) {
      throw createError.unauthorized('Authentication required');
    }

    const sessions = await authService.getActiveSessions(req.user.userId);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir les informations d'une session
router.get('/session-info', async (req, res, next) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      throw createError.badRequest('Token is required');
    }

    const sessionInfo = await authService.getSessionInfo(token);

    res.json({
      success: true,
      data: sessionInfo
    });
  } catch (error) {
    next(error);
  }
});

// Route de changement de mot de passe
router.post('/change-password', authenticateToken, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!req.user) {
      throw createError.unauthorized('Authentication required');
    }

    if (!currentPassword || !newPassword) {
      throw createError.badRequest('Current password and new password are required');
    }

    const result = await authService.changePassword(req.user.userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

// Route de demande de réinitialisation de mot de passe
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw createError.badRequest('Email is required');
    }

    const result = await authService.forgotPassword(email);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

// Route de réinitialisation de mot de passe
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      throw createError.badRequest('Token and new password are required');
    }

    const result = await authService.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

// Route de vérification de token
router.get('/verify', authenticateToken, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour récupérer le profil utilisateur
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    if (!req.user) {
      throw createError.unauthorized('Authentication required');
    }

    const profile = await authService.getUserProfile(req.user.userId);

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: profile
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour vérifier l'email
router.post('/verify-email', emailVerificationRateLimit, async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw createError.badRequest('Verification token is required');
    }

    const result = await authService.verifyEmail(token);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

// Route pour renvoyer l'email de vérification
router.post('/resend-verification', emailVerificationRateLimit, async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createError.badRequest('Email is required');
    }

    const result = await authService.resendVerificationEmail(email);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

// Route pour demander la réinitialisation de mot de passe
router.post('/forgot-password', passwordResetRateLimit, async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createError.badRequest('Email is required');
    }

    const result = await authService.forgotPassword(email);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

// Routes utilitaires Redis (admin seulement)
router.get('/redis/stats', authenticateToken, async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw createError.forbidden('Admin access required');
    }

    const stats = await authService.getRedisStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

router.get('/redis/ping', authenticateToken, async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw createError.forbidden('Admin access required');
    }

    const ping = await authService.pingRedis();

    res.json({
      success: true,
      data: { ping }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/redis/cleanup', authenticateToken, async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw createError.forbidden('Admin access required');
    }

    const cleaned = await authService.cleanupExpiredTokens();

    res.json({
      success: true,
      message: `Cleaned up ${cleaned} expired tokens`,
      data: { cleaned }
    });
  } catch (error) {
    next(error);
  }
});

// ---- Google OAuth2 ----
// Start Google OAuth flow
router.get('/google', validateRedirectUrl, (req, res, next) => {
  const scope = ['profile', 'email'];
  const state = typeof req.query.redirect === 'string' ? req.query.redirect : undefined;
  const authenticator = passport.authenticate('google', {
    scope,
    state
  } as any);
  authenticator(req, res, next);
});

// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_oauth_failed' } as any), async (req, res, next) => {
  try {
    const googleData: any = req.user;
    const redirect = (googleData && googleData.state) || (req.query.state as string) || (process.env.FRONTEND_URL || 'http://localhost:3000');

    if (!googleData || !googleData.profile) {
      throw createError.unauthorized('Google authentication failed');
    }

    const profile = googleData.profile;
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    const firstName = profile.name?.givenName || 'Google';
    const lastName = profile.name?.familyName || 'User';
    const avatar = profile.photos && profile.photos[0] && profile.photos[0].value;
    const googleId = profile.id;

    if (!email) {
      throw createError.badRequest('Google account has no email');
    }

    // Delegate to service method to create/link user and issue tokens
    const result = await authService.googleLogin({
      email,
      firstName,
      lastName,
      avatar,
      googleId,
      accessToken: googleData.tokens?.accessToken,
      refreshToken: googleData.tokens?.refreshToken
    });

    // Redirect with tokens as URL fragments to avoid logs
    const url = new URL(redirect);
    url.hash = `accessToken=${encodeURIComponent(result.accessToken)}&refreshToken=${encodeURIComponent(result.refreshToken)}`;
    return res.redirect(url.toString());
  } catch (error) {
    next(error);
  }
});

export default router;
