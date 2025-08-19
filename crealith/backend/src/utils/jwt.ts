import jwt, { SignOptions } from 'jsonwebtoken';
import { AppError } from './errors';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

const JWT_SECRET: string = process.env.JWT_SECRET || 'fallback-secret';

const rawExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
const JWT_EXPIRES_IN = /^\d+$/.test(rawExpiresIn)
  ? Number(rawExpiresIn)
  : rawExpiresIn;

export const generateToken = (payload: TokenPayload): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    throw new AppError('Invalid token', 401);
  }
};
