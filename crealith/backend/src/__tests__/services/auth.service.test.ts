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
});
