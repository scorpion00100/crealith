import { createError } from './errors';
import { SecureLogger } from './secure-logger';

/**
 * Types de fichiers supportés
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const;

export const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
] as const;

export const SUPPORTED_ARCHIVE_TYPES = [
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/gzip',
  'application/x-tar',
] as const;

export const SUPPORTED_CODE_TYPES = [
  'text/javascript',
  'text/typescript',
  'text/css',
  'text/html',
  'text/xml',
  'application/json',
  'application/x-yaml',
] as const;

export const ALL_SUPPORTED_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  ...SUPPORTED_DOCUMENT_TYPES,
  ...SUPPORTED_ARCHIVE_TYPES,
  ...SUPPORTED_CODE_TYPES,
] as const;

/**
 * Tailles maximales par type de fichier (en bytes)
 */
export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  document: 50 * 1024 * 1024, // 50MB
  archive: 100 * 1024 * 1024, // 100MB
  code: 5 * 1024 * 1024, // 5MB
  default: 10 * 1024 * 1024, // 10MB
} as const;

/**
 * Signatures de fichiers (magic numbers) pour validation
 */
export const FILE_SIGNATURES = {
  'image/jpeg': ['FF D8 FF'],
  'image/png': ['89 50 4E 47'],
  'image/gif': ['47 49 46 38'],
  'image/webp': ['52 49 46 46'],
  'application/pdf': ['25 50 44 46'],
  'application/zip': ['50 4B 03 04', '50 4B 05 06', '50 4B 07 08'],
  'application/x-rar-compressed': ['52 61 72 20'],
} as const;

/**
 * Interface pour les options de validation
 */
export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: readonly string[];
  requireSignature?: boolean;
  customValidator?: (file: Express.Multer.File) => Promise<boolean>;
}

/**
 * Classe pour la validation des fichiers
 */
export class FileValidator {
  /**
   * Valide un fichier selon les options fournies
   */
  static async validateFile(
    file: Express.Multer.File,
    options: FileValidationOptions = {}
  ): Promise<void> {
    const {
      maxSize = MAX_FILE_SIZES.default,
      allowedTypes = ALL_SUPPORTED_TYPES,
      requireSignature = true,
      customValidator,
    } = options;

    // Vérifier que le fichier existe
    if (!file) {
      throw createError.badRequest('Aucun fichier fourni');
    }

    // Vérifier la taille du fichier
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      throw createError.badRequest(`Fichier trop volumineux. Taille maximale: ${maxSizeMB}MB`);
    }

    // Vérifier le type MIME
    if (!allowedTypes.includes(file.mimetype)) {
      throw createError.badRequest(
        `Type de fichier non supporté: ${file.mimetype}. Types autorisés: ${allowedTypes.join(', ')}`
      );
    }

    // Vérifier la signature du fichier si requise
    if (requireSignature && file.buffer) {
      await this.validateFileSignature(file);
    }

    // Validation personnalisée
    if (customValidator) {
      const isValid = await customValidator(file);
      if (!isValid) {
        throw createError.badRequest('Fichier invalide selon les critères personnalisés');
      }
    }

    // Log de validation réussie
    SecureLogger.info('File validation successful', {
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    });
  }

  /**
   * Valide la signature (magic number) d'un fichier
   */
  static async validateFileSignature(file: Express.Multer.File): Promise<void> {
    if (!file.buffer || file.buffer.length < 4) {
      throw createError.badRequest('Fichier corrompu ou invalide');
    }

    const signatures = FILE_SIGNATURES[file.mimetype as keyof typeof FILE_SIGNATURES];
    if (!signatures) {
      // Pas de signature définie pour ce type, on accepte
      return;
    }

    const fileHeader = Array.from(file.buffer.slice(0, 8))
      .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');

    const isValidSignature = signatures.some(signature => 
      fileHeader.startsWith(signature)
    );

    if (!isValidSignature) {
      SecureLogger.security('Invalid file signature detected', undefined, undefined, {
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileHeader: fileHeader.substring(0, 20),
      });
      throw createError.badRequest('Signature de fichier invalide. Le fichier pourrait être corrompu ou malveillant.');
    }
  }

  /**
   * Valide une image spécifiquement
   */
  static async validateImage(
    file: Express.Multer.File,
    options: Omit<FileValidationOptions, 'allowedTypes'> = {}
  ): Promise<void> {
    await this.validateFile(file, {
      ...options,
      allowedTypes: SUPPORTED_IMAGE_TYPES,
      maxSize: options.maxSize || MAX_FILE_SIZES.image,
    });

    // Validation supplémentaire pour les images
    await this.validateImageDimensions(file);
  }

  /**
   * Valide les dimensions d'une image
   */
  static async validateImageDimensions(file: Express.Multer.File): Promise<void> {
    // Pour une validation complète des dimensions, on pourrait utiliser une librairie comme 'sharp'
    // Pour l'instant, on fait une validation basique
    if (file.mimetype.startsWith('image/')) {
      // Vérifier que le fichier n'est pas vide
      if (file.size < 100) {
        throw createError.badRequest('Image trop petite ou corrompue');
      }
    }
  }

  /**
   * Valide un document
   */
  static async validateDocument(
    file: Express.Multer.File,
    options: Omit<FileValidationOptions, 'allowedTypes'> = {}
  ): Promise<void> {
    await this.validateFile(file, {
      ...options,
      allowedTypes: SUPPORTED_DOCUMENT_TYPES,
      maxSize: options.maxSize || MAX_FILE_SIZES.document,
    });
  }

  /**
   * Valide une archive
   */
  static async validateArchive(
    file: Express.Multer.File,
    options: Omit<FileValidationOptions, 'allowedTypes'> = {}
  ): Promise<void> {
    await this.validateFile(file, {
      ...options,
      allowedTypes: SUPPORTED_ARCHIVE_TYPES,
      maxSize: options.maxSize || MAX_FILE_SIZES.archive,
    });
  }

  /**
   * Valide un fichier de code
   */
  static async validateCodeFile(
    file: Express.Multer.File,
    options: Omit<FileValidationOptions, 'allowedTypes'> = {}
  ): Promise<void> {
    await this.validateFile(file, {
      ...options,
      allowedTypes: SUPPORTED_CODE_TYPES,
      maxSize: options.maxSize || MAX_FILE_SIZES.code,
    });
  }

  /**
   * Nettoie le nom de fichier
   */
  static sanitizeFileName(fileName: string): string {
    // Supprimer les caractères dangereux
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '')
      .substring(0, 255); // Limiter la longueur
  }

  /**
   * Génère un nom de fichier sécurisé
   */
  static generateSecureFileName(originalName: string, userId: string): string {
    const timestamp = Date.now();
    const sanitizedName = this.sanitizeFileName(originalName);
    const extension = sanitizedName.split('.').pop() || '';
    const nameWithoutExt = sanitizedName.replace(/\.[^/.]+$/, '');
    
    return `${userId}_${timestamp}_${nameWithoutExt}.${extension}`;
  }

  /**
   * Vérifie si un fichier est potentiellement malveillant
   */
  static async checkForMaliciousContent(file: Express.Multer.File): Promise<void> {
    if (!file.buffer) {
      return;
    }

    const content = file.buffer.toString('utf8', 0, Math.min(1024, file.buffer.length));
    
    // Patterns suspects
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\(/i,
      /document\.write/i,
      /window\.location/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        SecureLogger.security('Suspicious file content detected', undefined, undefined, {
          fileName: file.originalname,
          mimeType: file.mimetype,
          pattern: pattern.toString(),
        });
        throw createError.badRequest('Contenu de fichier suspect détecté');
      }
    }
  }

  /**
   * Valide un fichier de produit (validation complète)
   */
  static async validateProductFile(file: Express.Multer.File): Promise<void> {
    // Validation de base
    await this.validateFile(file, {
      maxSize: MAX_FILE_SIZES.archive, // Les produits peuvent être des archives
      allowedTypes: [...SUPPORTED_ARCHIVE_TYPES, ...SUPPORTED_DOCUMENT_TYPES, ...SUPPORTED_CODE_TYPES],
    });

    // Vérification de contenu malveillant
    await this.checkForMaliciousContent(file);

    // Validation supplémentaire selon le type
    if (SUPPORTED_ARCHIVE_TYPES.includes(file.mimetype as any)) {
      await this.validateArchive(file);
    } else if (SUPPORTED_DOCUMENT_TYPES.includes(file.mimetype as any)) {
      await this.validateDocument(file);
    } else if (SUPPORTED_CODE_TYPES.includes(file.mimetype as any)) {
      await this.validateCodeFile(file);
    }
  }
}

export default FileValidator;
