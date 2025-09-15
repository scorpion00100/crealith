import ImageKit from 'imagekit';
import { createError } from '../utils/errors';

// Configuration ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export interface ImageKitAuthResponse {
  token: string;
  expire: number;
  signature: string;
}

export interface ImageKitUploadResponse {
  fileId: string;
  name: string;
  size: number;
  filePath: string;
  url: string;
  thumbnailUrl: string;
  height: number;
  width: number;
  fileType: string;
  tags?: string[];
  customMetadata?: Record<string, any>;
}

export class ImageKitService {
  // Générer un token d'authentification pour le frontend
  static generateAuthToken(userId: string): ImageKitAuthResponse {
    try {
      const token = imagekit.getAuthenticationParameters();
      return {
        token: token.token,
        expire: token.expire,
        signature: token.signature,
      };
    } catch (error) {
      throw createError.internal('Erreur lors de la génération du token ImageKit');
    }
  }

  // Upload d'image via le backend (pour les cas où l'upload direct n'est pas possible)
  static async uploadImage(
    file: Buffer,
    fileName: string,
    folder: string = '/crealith/products',
    tags: string[] = ['product']
  ): Promise<ImageKitUploadResponse> {
    try {
      const result = await imagekit.upload({
        file: file,
        fileName: fileName,
        folder: folder,
        tags: tags,
        useUniqueFileName: true,
        responseFields: ['fileId', 'name', 'size', 'filePath', 'url', 'thumbnailUrl', 'height', 'width', 'fileType'],
      });

      return {
        fileId: result.fileId,
        name: result.name,
        size: result.size,
        filePath: result.filePath,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        height: result.height,
        width: result.width,
        fileType: result.fileType,
        tags: result.tags,
        customMetadata: result.customMetadata,
      };
    } catch (error) {
      console.error('ImageKit upload error:', error);
      throw createError.badRequest('Erreur lors de l\'upload de l\'image');
    }
  }

  // Supprimer une image
  static async deleteImage(fileId: string): Promise<boolean> {
    try {
      await imagekit.deleteFile(fileId);
      return true;
    } catch (error) {
      console.error('ImageKit delete error:', error);
      throw createError.badRequest('Erreur lors de la suppression de l\'image');
    }
  }

  // Obtenir les détails d'une image
  static async getImageDetails(fileId: string): Promise<any> {
    try {
      const result = await imagekit.getFileDetails(fileId);
      return result;
    } catch (error) {
      console.error('ImageKit get details error:', error);
      throw createError.notFound('Image non trouvée');
    }
  }

  // Lister les images dans un dossier
  static async listImages(
    folder: string = '/crealith/products',
    limit: number = 100,
    skip: number = 0
  ): Promise<any[]> {
    try {
      const result = await imagekit.listFiles({
        path: folder,
        limit: limit,
        skip: skip,
      });
      return result;
    } catch (error) {
      console.error('ImageKit list error:', error);
      throw createError.badRequest('Erreur lors de la récupération des images');
    }
  }

  // Créer un dossier
  static async createFolder(folderName: string, parentFolderPath: string = '/'): Promise<any> {
    try {
      const result = await imagekit.createFolder({
        folderName: folderName,
        parentFolderPath: parentFolderPath,
      });
      return result;
    } catch (error) {
      console.error('ImageKit create folder error:', error);
      throw createError.badRequest('Erreur lors de la création du dossier');
    }
  }

  // Supprimer un dossier
  static async deleteFolder(folderPath: string): Promise<boolean> {
    try {
      await imagekit.deleteFolder(folderPath);
      return true;
    } catch (error) {
      console.error('ImageKit delete folder error:', error);
      throw createError.badRequest('Erreur lors de la suppression du dossier');
    }
  }

  // Obtenir les métadonnées d'une image
  static async getImageMetadata(fileId: string): Promise<any> {
    try {
      const result = await imagekit.getFileMetadata(fileId);
      return result;
    } catch (error) {
      console.error('ImageKit get metadata error:', error);
      throw createError.notFound('Métadonnées non trouvées');
    }
  }

  // Mettre à jour les métadonnées d'une image
  static async updateImageMetadata(
    fileId: string,
    tags?: string[],
    customMetadata?: Record<string, any>
  ): Promise<any> {
    try {
      const updateData: any = {};
      if (tags) updateData.tags = tags;
      if (customMetadata) updateData.customMetadata = customMetadata;

      const result = await imagekit.updateFileDetails(fileId, updateData);
      return result;
    } catch (error) {
      console.error('ImageKit update metadata error:', error);
      throw createError.badRequest('Erreur lors de la mise à jour des métadonnées');
    }
  }

  // Générer une URL d'image avec transformations
  static generateImageUrl(
    imagePath: string,
    transformations?: Record<string, any>
  ): string {
    try {
      return imagekit.url({
        src: imagePath,
        transformation: transformations ? [transformations] : undefined,
      });
    } catch (error) {
      console.error('ImageKit URL generation error:', error);
      throw createError.badRequest('Erreur lors de la génération de l\'URL');
    }
  }

  // Purger le cache d'une image
  static async purgeImageCache(imagePath: string): Promise<boolean> {
    try {
      await imagekit.purgeCache(imagePath);
      return true;
    } catch (error) {
      console.error('ImageKit purge cache error:', error);
      throw createError.badRequest('Erreur lors de la purge du cache');
    }
  }
}

export default ImageKitService;
