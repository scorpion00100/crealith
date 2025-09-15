import bcrypt from 'bcryptjs';
import { SecureLogger } from './secure-logger';

/**
 * Configuration de la politique de mot de passe
 */
export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxConsecutiveChars: number;
  maxRepeatingChars: number;
  forbiddenPasswords: string[];
  passwordHistory: number; // Nombre de mots de passe précédents à vérifier
}

/**
 * Politique de mot de passe par défaut
 */
export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxConsecutiveChars: 3,
  maxRepeatingChars: 2,
  forbiddenPasswords: [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    'dragon', 'master', 'hello', 'login', 'princess',
    'rockyou', '123123', '654321', 'superman', 'qazwsx',
    'michael', 'football', 'baseball', 'welcome123', 'abc123456',
    'password1', '1234567890', 'qwerty123', 'admin123', 'root',
    'toor', 'pass', 'test', 'guest', 'user',
    'administrator', 'system', 'service', 'support', 'help',
    'info', 'demo', 'sample', 'example', 'default',
    'changeme', 'newpassword', 'temp', 'temporary', 'backup',
    'restore', 'reset', 'recovery', 'recover', 'forgot',
    'remember', 'rememberme', 'stayloggedin', 'autologin', 'autologon',
    'crealith', 'crealith123', 'crealith2024', 'crealith2025',
  ],
  passwordHistory: 5,
};

/**
 * Classe pour la gestion de la politique de mot de passe
 */
export class PasswordPolicyManager {
  private policy: PasswordPolicy;

  constructor(policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY) {
    this.policy = policy;
  }

  /**
   * Valide un mot de passe selon la politique
   */
  validatePassword(password: string, userInfo?: { email?: string; firstName?: string; lastName?: string }): {
    isValid: boolean;
    errors: string[];
    score: number;
  } {
    const errors: string[] = [];
    let score = 0;

    // Vérification de la longueur
    if (password.length < this.policy.minLength) {
      errors.push(`Password must be at least ${this.policy.minLength} characters long`);
    } else {
      score += 20;
    }

    if (password.length > this.policy.maxLength) {
      errors.push(`Password must be less than ${this.policy.maxLength} characters`);
    }

    // Vérification des caractères requis
    if (this.policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (this.policy.requireUppercase) {
      score += 15;
    }

    if (this.policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (this.policy.requireLowercase) {
      score += 15;
    }

    if (this.policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else if (this.policy.requireNumbers) {
      score += 15;
    }

    if (this.policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else if (this.policy.requireSpecialChars) {
      score += 15;
    }

    // Vérification des caractères consécutifs
    if (this.hasConsecutiveChars(password, this.policy.maxConsecutiveChars)) {
      errors.push(`Password cannot contain more than ${this.policy.maxConsecutiveChars} consecutive characters`);
    } else {
      score += 10;
    }

    // Vérification des caractères répétitifs
    if (this.hasRepeatingChars(password, this.policy.maxRepeatingChars)) {
      errors.push(`Password cannot contain more than ${this.policy.maxRepeatingChars} repeating characters`);
    } else {
      score += 10;
    }

    // Vérification des mots de passe interdits
    if (this.isForbiddenPassword(password)) {
      errors.push('Password is too common or easily guessable');
    } else {
      score += 10;
    }

    // Vérification des informations personnelles
    if (userInfo && this.containsPersonalInfo(password, userInfo)) {
      errors.push('Password cannot contain personal information');
    } else {
      score += 10;
    }

    // Vérification de la complexité
    const complexityScore = this.calculateComplexity(password);
    score += complexityScore;

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.min(score, 100),
    };
  }

  /**
   * Vérifie si le mot de passe contient des caractères consécutifs
   */
  private hasConsecutiveChars(password: string, maxConsecutive: number): boolean {
    const chars = password.toLowerCase();
    
    for (let i = 0; i < chars.length - maxConsecutive; i++) {
      let consecutive = true;
      for (let j = 1; j <= maxConsecutive; j++) {
        if (chars.charCodeAt(i + j) !== chars.charCodeAt(i) + j) {
          consecutive = false;
          break;
        }
      }
      if (consecutive) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Vérifie si le mot de passe contient des caractères répétitifs
   */
  private hasRepeatingChars(password: string, maxRepeating: number): boolean {
    const chars = password.toLowerCase();
    
    for (let i = 0; i < chars.length - maxRepeating; i++) {
      let repeating = true;
      for (let j = 1; j <= maxRepeating; j++) {
        if (chars[i] !== chars[i + j]) {
          repeating = false;
          break;
        }
      }
      if (repeating) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Vérifie si le mot de passe est dans la liste des mots interdits
   */
  private isForbiddenPassword(password: string): boolean {
    const lowerPassword = password.toLowerCase();
    return this.policy.forbiddenPasswords.some(forbidden => 
      lowerPassword.includes(forbidden.toLowerCase())
    );
  }

  /**
   * Vérifie si le mot de passe contient des informations personnelles
   */
  private containsPersonalInfo(password: string, userInfo: { email?: string; firstName?: string; lastName?: string }): boolean {
    const lowerPassword = password.toLowerCase();
    
    if (userInfo.email) {
      const emailParts = userInfo.email.toLowerCase().split('@')[0];
      if (lowerPassword.includes(emailParts) && emailParts.length > 3) {
        return true;
      }
    }
    
    if (userInfo.firstName && userInfo.firstName.length > 2) {
      if (lowerPassword.includes(userInfo.firstName.toLowerCase())) {
        return true;
      }
    }
    
    if (userInfo.lastName && userInfo.lastName.length > 2) {
      if (lowerPassword.includes(userInfo.lastName.toLowerCase())) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Calcule le score de complexité du mot de passe
   */
  private calculateComplexity(password: string): number {
    let score = 0;
    
    // Bonus pour la longueur
    if (password.length >= 12) score += 5;
    if (password.length >= 16) score += 5;
    if (password.length >= 20) score += 5;
    
    // Bonus pour la diversité des caractères
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    const charTypes = [hasUpper, hasLower, hasNumbers, hasSpecial].filter(Boolean).length;
    score += charTypes * 5;
    
    // Bonus pour les patterns complexes
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      score += 10;
    }
    
    return Math.min(score, 20);
  }

  /**
   * Génère un mot de passe sécurisé
   */
  generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    
    // Assurer au moins un caractère de chaque type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Remplir le reste avec des caractères aléatoires
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mélanger le mot de passe
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Vérifie si un mot de passe a été utilisé récemment
   */
  async checkPasswordHistory(
    newPassword: string, 
    passwordHistory: string[], 
    userId: string
  ): Promise<{ isReused: boolean; message?: string }> {
    try {
      for (const oldPasswordHash of passwordHistory) {
        const isMatch = await bcrypt.compare(newPassword, oldPasswordHash);
        if (isMatch) {
          SecureLogger.security('Password reuse attempt', undefined, undefined, {
            userId,
            message: 'User attempted to reuse a previous password',
          });
          
          return {
            isReused: true,
            message: 'Password has been used recently. Please choose a different password.',
          };
        }
      }
      
      return { isReused: false };
    } catch (error) {
      SecureLogger.error('Error checking password history', error, { userId });
      return { isReused: false };
    }
  }

  /**
   * Met à jour la politique de mot de passe
   */
  updatePolicy(newPolicy: Partial<PasswordPolicy>): void {
    this.policy = { ...this.policy, ...newPolicy };
    SecureLogger.info('Password policy updated', { policy: this.policy });
  }

  /**
   * Obtient la politique actuelle
   */
  getPolicy(): PasswordPolicy {
    return { ...this.policy };
  }

  /**
   * Obtient les exigences de mot de passe sous forme de texte
   */
  getPasswordRequirements(): string[] {
    const requirements: string[] = [];
    
    requirements.push(`At least ${this.policy.minLength} characters long`);
    requirements.push(`Maximum ${this.policy.maxLength} characters`);
    
    if (this.policy.requireUppercase) {
      requirements.push('At least one uppercase letter (A-Z)');
    }
    
    if (this.policy.requireLowercase) {
      requirements.push('At least one lowercase letter (a-z)');
    }
    
    if (this.policy.requireNumbers) {
      requirements.push('At least one number (0-9)');
    }
    
    if (this.policy.requireSpecialChars) {
      requirements.push('At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    }
    
    requirements.push(`No more than ${this.policy.maxConsecutiveChars} consecutive characters`);
    requirements.push(`No more than ${this.policy.maxRepeatingChars} repeating characters`);
    requirements.push('Cannot contain personal information');
    requirements.push('Cannot be a common or easily guessable password');
    
    return requirements;
  }
}

// Instance singleton
export const passwordPolicyManager = new PasswordPolicyManager();

/**
 * Fonction utilitaire pour valider un mot de passe
 */
export const validatePassword = (
  password: string, 
  userInfo?: { email?: string; firstName?: string; lastName?: string }
) => {
  return passwordPolicyManager.validatePassword(password, userInfo);
};

/**
 * Fonction utilitaire pour générer un mot de passe sécurisé
 */
export const generateSecurePassword = (length?: number) => {
  return passwordPolicyManager.generateSecurePassword(length);
};

/**
 * Fonction utilitaire pour obtenir les exigences de mot de passe
 */
export const getPasswordRequirements = () => {
  return passwordPolicyManager.getPasswordRequirements();
};

export default passwordPolicyManager;
