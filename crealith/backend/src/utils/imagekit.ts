import ImageKit from 'imagekit';
import { createError } from './errors';
import { SecureLogger } from './secure-logger';
import { FileValidator } from './file-validation';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export interface ImageKitUploadResult {
  url: string;
  fileId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
}

export const uploadToImageKit = async (
  file: Express.Multer.File,
  folder: string = 'uploads',
  userId?: string
): Promise<ImageKitUploadResult> => {
  try {
    // Validation du fichier avant upload
    await FileValidator.validateImage(file);
    
    // Génération d'un nom de fichier sécurisé
    const secureFileName = userId 
      ? FileValidator.generateSecureFileName(file.originalname, userId)
      : `${folder}/${Date.now()}-${FileValidator.sanitizeFileName(file.originalname)}`;
    
    const uploadResponse = await new Promise<ImageKitUploadResult>((resolve, reject) => {
      imagekit.upload({
        file: file.buffer,
        fileName: secureFileName,
        folder: folder,
        useUniqueFileName: true,
        tags: ['crealith', folder, userId ? `user:${userId}` : 'anonymous'],
        responseFields: ['url', 'fileId', 'fileName', 'filePath', 'fileType', 'fileSize'],
        // Ajouter des transformations par défaut pour optimiser les images
        // transformation: [{
        //   quality: 80,
        //   format: 'auto',
        // }],
      }, (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.url,
            fileId: result.fileId,
            fileName: result.name,
            filePath: result.filePath,
            fileType: result.fileType,
            fileSize: result.size,
          });
        } else {
          reject(new Error('Upload failed'));
        }
      });
    });

    SecureLogger.info('ImageKit upload successful', {
      fileId: uploadResponse.fileId,
      fileName: uploadResponse.fileName,
      fileSize: uploadResponse.fileSize,
      folder,
      userId: userId ? userId.substring(0, 8) + '...' : 'anonymous',
    });

    return uploadResponse;
  } catch (error) {
    SecureLogger.error('ImageKit upload failed', error, { 
      fileName: file.originalname,
      fileSize: file.size,
      folder,
      userId: userId ? userId.substring(0, 8) + '...' : 'anonymous',
    });
    throw createError.internal('Failed to upload file');
  }
};

export const deleteFromImageKit = async (fileId: string, userId?: string): Promise<void> => {
  try {
    // Validation de l'ID du fichier
    if (!fileId || typeof fileId !== 'string' || fileId.length < 10) {
      throw new Error('Invalid file ID');
    }

    await new Promise<void>((resolve, reject) => {
      imagekit.deleteFile(fileId, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    SecureLogger.info('ImageKit delete successful', {
      fileId: fileId.substring(0, 8) + '...',
      userId: userId ? userId.substring(0, 8) + '...' : 'anonymous',
    });
  } catch (error) {
    SecureLogger.warn('ImageKit delete failed', { 
      fileId: fileId.substring(0, 8) + '...',
      userId: userId ? userId.substring(0, 8) + '...' : 'anonymous',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    // Ne pas faire échouer l'opération si la suppression échoue
  }
};

export const getImageKitUrl = (filePath: string, transformation?: string): string => {
  try {
    if (transformation) {
      return imagekit.url({
        path: filePath,
        transformation: [{ name: transformation }],
      });
    }
    return imagekit.url({ path: filePath });
  } catch (error) {
    SecureLogger.error('ImageKit URL generation failed', error, {
      filePath: filePath.substring(0, 50) + '...',
      transformation
    });
    // Retourner l'URL de base en cas d'erreur
    return `${process.env.IMAGEKIT_URL_ENDPOINT}/${filePath}`;
  }
};

// Nouvelle fonction pour générer des URLs avec transformations optimisées
export const getOptimizedImageUrl = (
  filePath: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpeg' | 'png';
  } = {}
): string => {
  try {
    const transformations = [];
    
    if (options.width || options.height) {
      transformations.push({
        width: options.width,
        height: options.height,
        cropMode: 'maintain_ratio',
      });
    }
    
    if (options.quality) {
      transformations.push({
        quality: options.quality,
      });
    }
    
    if (options.format) {
      transformations.push({
        format: options.format,
      });
    }

    return imagekit.url({
      path: filePath,
      transformation: transformations,
    });
  } catch (error) {
    SecureLogger.error('Optimized ImageKit URL generation failed', error, {
      filePath: filePath.substring(0, 50) + '...',
      options
    });
    return getImageKitUrl(filePath);
  }
};
