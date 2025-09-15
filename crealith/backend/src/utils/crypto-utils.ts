import crypto from 'crypto';

/**
 * Génère un token sécurisé
 */
export const generateSecureToken = (length: number = 32, seed?: string): string => {
  const bytes = crypto.randomBytes(length);
  return bytes.toString('hex');
};

/**
 * Génère un hash sécurisé
 */
export const generateSecureHash = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Génère un UUID v4
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};
