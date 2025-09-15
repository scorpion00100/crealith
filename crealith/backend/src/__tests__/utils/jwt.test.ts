import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyAccessToken, 
  verifyRefreshToken,
  getTokenInfo 
} from '../../utils/jwt';

// Mock des variables d'environnement
const originalEnv = process.env;

describe('JWT Utils', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      JWT_ACCESS_SECRET: 'test-access-secret-key-that-is-long-enough-for-security',
      JWT_REFRESH_SECRET: 'test-refresh-secret-key-that-is-long-enough-for-security',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'BUYER',
      };

      const token = generateAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include all required fields in token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'BUYER',
      };

      const token = generateAccessToken(payload);
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

      expect(decoded.userId).toBe('user123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('BUYER');
      expect(decoded.type).toBe('access');
      expect(decoded.version).toBe(1);
      expect(decoded.iss).toBe('crealith-api');
      expect(decoded.aud).toBe('crealith-users');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'BUYER',
      };

      const token = generateRefreshToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include unique token ID', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'BUYER',
      };

      const token1 = generateRefreshToken(payload);
      const token2 = generateRefreshToken(payload);

      const decoded1 = JSON.parse(Buffer.from(token1.split('.')[1], 'base64').toString());
      const decoded2 = JSON.parse(Buffer.from(token2.split('.')[1], 'base64').toString());

      expect(decoded1.jti).toBeDefined();
      expect(decoded2.jti).toBeDefined();
      expect(decoded1.jti).not.toBe(decoded2.jti); // Should be unique
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'BUYER',
      };

      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe('user123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('BUYER');
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyAccessToken('invalid-token');
      }).toThrow();
    });

    it('should throw error for refresh token used as access token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'BUYER',
      };

      const refreshToken = generateRefreshToken(payload);

      expect(() => {
        verifyAccessToken(refreshToken);
      }).toThrow('Invalid token type');
    });

    it('should throw error for expired token', () => {
      // Set a very short expiration
      process.env.JWT_ACCESS_EXPIRES_IN = '1ms';

      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'BUYER',
      };

      const token = generateAccessToken(payload);

      // Wait for token to expire
      setTimeout(() => {
        expect(() => {
          verifyAccessToken(token);
        }).toThrow('Access token expired');
      }, 10);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'BUYER',
      };

      const token = generateRefreshToken(payload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.userId).toBe('user123');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('BUYER');
    });

    it('should throw error for access token used as refresh token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'BUYER',
      };

      const accessToken = generateAccessToken(payload);

      expect(() => {
        verifyRefreshToken(accessToken);
      }).toThrow('Invalid token type');
    });
  });

  describe('getTokenInfo', () => {
    it('should return token information without verification', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'BUYER',
      };

      const token = generateAccessToken(payload);
      const info = getTokenInfo(token);

      expect(info.type).toBe('access');
      expect(info.expiresAt).toBeInstanceOf(Date);
      expect(info.expiresAt!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should handle invalid token format', () => {
      expect(() => {
        getTokenInfo('invalid-token');
      }).toThrow('Invalid token format');
    });
  });

  describe('Token Security', () => {
    it('should throw error if JWT secrets are not provided', () => {
      delete process.env.JWT_ACCESS_SECRET;
      delete process.env.JWT_REFRESH_SECRET;

      expect(() => {
        require('../../utils/jwt');
      }).toThrow('JWT secrets must be provided in environment variables');
    });

    it('should throw error if JWT secrets are too short', () => {
      process.env.JWT_ACCESS_SECRET = 'short';
      process.env.JWT_REFRESH_SECRET = 'short';

      expect(() => {
        require('../../utils/jwt');
      }).toThrow('JWT secrets must be at least 32 characters long');
    });

    it('should use different secrets for access and refresh tokens', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'BUYER',
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Try to verify access token with refresh secret (should fail)
      expect(() => {
        const jwt = require('jsonwebtoken');
        jwt.verify(accessToken, process.env.JWT_REFRESH_SECRET);
      }).toThrow();

      // Try to verify refresh token with access secret (should fail)
      expect(() => {
        const jwt = require('jsonwebtoken');
        jwt.verify(refreshToken, process.env.JWT_ACCESS_SECRET);
      }).toThrow();
    });
  });
});
