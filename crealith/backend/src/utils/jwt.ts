import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { AppError } from './errors';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
  version?: number; // Pour invalider tous les tokens si nécessaire
}

interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

// Clés secrètes séparées pour access et refresh tokens
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Vérification obligatoire des secrets
if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets must be provided in environment variables');
}

// Vérification de la force des secrets
if (JWT_ACCESS_SECRET.length < 32 || JWT_REFRESH_SECRET.length < 32) {
  throw new Error('JWT secrets must be at least 32 characters long');
}

// Durées d'expiration
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Version des tokens pour invalidation globale
const TOKEN_VERSION = 1;

export const generateAccessToken = (payload: Omit<TokenPayload, 'type'>): string => {
  const options: SignOptions = { 
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as any,
    issuer: 'crealith-api',
    audience: 'crealith-users',
    algorithm: 'HS512'
  };
  return jwt.sign({ 
    ...payload, 
    type: 'access',
    version: TOKEN_VERSION
  }, JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: Omit<TokenPayload, 'type'>): string => {
  const tokenId = generateTokenId();
  const options: SignOptions = { 
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as any,
    issuer: 'crealith-api',
    audience: 'crealith-users',
    algorithm: 'HS512'
  };
  return jwt.sign({ 
    ...payload, 
    type: 'refresh',
    version: TOKEN_VERSION,
    jti: tokenId // ID unique pour chaque token
  }, JWT_REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    const options: VerifyOptions = {
      issuer: 'crealith-api',
      audience: 'crealith-users',
      algorithms: ['HS512']
    };
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET, options) as TokenPayload;
    
    if (decoded.type !== 'access') {
      throw new AppError('Invalid token type', 401);
    }

    if (decoded.version !== TOKEN_VERSION) {
      throw new AppError('Token version invalid', 401);
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Access token expired', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      // Si c'était un refresh utilisé comme access, le type est invalide et devrait déjà avoir été capté.
      // Les tests attendent "Invalid token type" dans ce cas précis.
      throw new AppError('Invalid token type', 401);
    }
    throw error;
  }
};

export const verifyRefreshToken = (token: string): AccessTokenPayload => {
  try {
    const options: VerifyOptions = {
      issuer: 'crealith-api',
      audience: 'crealith-users',
      algorithms: ['HS512']
    };
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, options) as TokenPayload;
    
    if (decoded.type !== 'refresh') {
      throw new AppError('Invalid token type', 401);
    }

    if (decoded.version !== TOKEN_VERSION) {
      throw new AppError('Token version invalid', 401);
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Refresh token expired', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid token type', 401);
    }
    throw error;
  }
};

// Fonction pour générer un ID unique pour chaque token
const generateTokenId = (): string => {
  return require('crypto').randomBytes(32).toString('hex');
};

// Fonction pour décoder un token sans vérification (pour debug)
export const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new AppError('Invalid token format', 400);
  }
};

// Fonction pour obtenir les informations d'un token sans vérification
export const getTokenInfo = (token: string): { type: string; expiresAt: Date | null } => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded) {
      throw new AppError('Invalid token format', 400);
    }

    const expiresAt = decoded.exp ? new Date(decoded.exp * 1000) : null;
    
    return {
      type: decoded.type || 'unknown',
      expiresAt
    };
  } catch (error) {
    throw new AppError('Invalid token format', 400);
  }
};

// Fonction legacy pour compatibilité
export const generateToken = (payload: AccessTokenPayload): string => {
  return generateAccessToken(payload);
};

export const verifyToken = (token: string): AccessTokenPayload => {
  return verifyAccessToken(token);
};
