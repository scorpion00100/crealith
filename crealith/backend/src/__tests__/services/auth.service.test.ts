import { AuthService } from '../../services/auth.service';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const authService = new AuthService();

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock jsonwebtoken
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

// Mock les utilitaires
jest.mock('../../utils/bcrypt', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn()
}));

jest.mock('../../utils/jwt', () => ({
  generateToken: jest.fn()
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      // Mock prisma.user.findUnique to return null (user doesn't exist)
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      // Mock hashPassword
      const { hashPassword } = require('../../utils/bcrypt');
      hashPassword.mockResolvedValue('hashedPassword');

      // Mock prisma.user.create
      const mockUser = {
        id: 'user123',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'BUYER',
        createdAt: new Date()
      };

      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser as any);

      // Mock generateToken
      const { generateToken } = require('../../utils/jwt');
      generateToken.mockReturnValue('mockToken');

      const result = await authService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(userData.email);
      expect(hashPassword).toHaveBeenCalledWith(userData.password);
      expect(generateToken).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      // Mock prisma.user.findUnique to return existing user
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: 'existing123',
        email: userData.email
      } as any);

      await expect(authService.register(userData)).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 'user123',
        email: loginData.email,
        passwordHash: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        role: 'BUYER',
        isActive: true
      };

      // Mock prisma.user.findUnique
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      // Mock comparePassword
      const { comparePassword } = require('../../utils/bcrypt');
      comparePassword.mockResolvedValue(true);

      // Mock generateToken
      const { generateToken } = require('../../utils/jwt');
      generateToken.mockReturnValue('mockToken');

      const result = await authService.login(loginData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(loginData.email);
      expect(comparePassword).toHaveBeenCalledWith(loginData.password, mockUser.passwordHash);
    });

    it('should throw error for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      // Mock prisma.user.findUnique to return null
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        id: 'user123',
        email: loginData.email,
        passwordHash: 'hashedPassword',
        isActive: true
      };

      // Mock prisma.user.findUnique
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      // Mock comparePassword to return false
      const { comparePassword } = require('../../utils/bcrypt');
      comparePassword.mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully and invalidate old password', async () => {
      const resetToken = 'valid-reset-token';
      const newPassword = 'NewSecurePassword123!';
      const userEmail = 'test@example.com';
      
      const mockUser = {
        id: 'user123',
        email: userEmail,
        passwordHash: 'oldHashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true
      };

      const mockResetTokenData = {
        email: userEmail,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
      };

      // Mock Redis service
      const mockRedisService = {
        getResetToken: jest.fn().mockResolvedValue(mockResetTokenData),
        revokeResetToken: jest.fn().mockResolvedValue(true),
        revokeAllUserTokens: jest.fn().mockResolvedValue(3) // 3 tokens revoked
      };

      // Mock prisma.user.findUnique
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      // Mock hashPassword
      const { hashPassword } = require('../../utils/bcrypt');
      const newHashedPassword = 'newHashedPassword123';
      hashPassword.mockResolvedValue(newHashedPassword);

      // Mock prisma.user.update
      const updatedUser = { ...mockUser, passwordHash: newHashedPassword };
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser as any);

      // Mock Redis service methods
      jest.doMock('../../services/redis.service', () => ({
        redisService: mockRedisService
      }));

      const result = await authService.resetPassword(resetToken, newPassword);

      // Verify the password was hashed and stored
      expect(hashPassword).toHaveBeenCalledWith(newPassword);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { passwordHash: newHashedPassword }
      });

      // Verify the reset token was revoked
      expect(mockRedisService.revokeResetToken).toHaveBeenCalledWith(resetToken);

      // Verify all user sessions were invalidated
      expect(mockRedisService.revokeAllUserTokens).toHaveBeenCalledWith(mockUser.id);

      expect(result.message).toBe('Password reset successfully. Please login with your new password.');
    });

    it('should throw error for invalid reset token', async () => {
      const invalidToken = 'invalid-token';
      const newPassword = 'NewSecurePassword123!';

      // Mock Redis service to return null (invalid token)
      const mockRedisService = {
        getResetToken: jest.fn().mockResolvedValue(null)
      };

      jest.doMock('../../services/redis.service', () => ({
        redisService: mockRedisService
      }));

      await expect(authService.resetPassword(invalidToken, newPassword))
        .rejects.toThrow('Invalid or expired reset token');
    });

    it('should throw error for expired reset token', async () => {
      const expiredToken = 'expired-token';
      const newPassword = 'NewSecurePassword123!';
      
      const mockResetTokenData = {
        email: 'test@example.com',
        expiresAt: new Date(Date.now() - 60 * 1000) // 1 minute ago (expired)
      };

      // Mock Redis service
      const mockRedisService = {
        getResetToken: jest.fn().mockResolvedValue(mockResetTokenData)
      };

      jest.doMock('../../services/redis.service', () => ({
        redisService: mockRedisService
      }));

      await expect(authService.resetPassword(expiredToken, newPassword))
        .rejects.toThrow('Reset token has expired');
    });

    it('should throw error if user not found', async () => {
      const resetToken = 'valid-reset-token';
      const newPassword = 'NewSecurePassword123!';
      const userEmail = 'nonexistent@example.com';
      
      const mockResetTokenData = {
        email: userEmail,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
      };

      // Mock Redis service
      const mockRedisService = {
        getResetToken: jest.fn().mockResolvedValue(mockResetTokenData)
      };

      // Mock prisma.user.findUnique to return null (user not found)
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      jest.doMock('../../services/redis.service', () => ({
        redisService: mockRedisService
      }));

      await expect(authService.resetPassword(resetToken, newPassword))
        .rejects.toThrow('User not found');
    });
  });
});
