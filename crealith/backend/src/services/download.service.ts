import prisma from '../prisma';
import ImageKit from 'imagekit';
import { createError } from '../utils/errors';

// Configuration ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
});

export interface DownloadToken {
  productId: string;
  userId: string;
  expiresAt: number;
  downloadCount: number;
}

export class DownloadService {
  // Générer une URL signée pour le téléchargement
  static async generateSecureDownloadUrl(
    productId: string,
    userId: string,
    maxDownloads: number = 3
  ): Promise<string> {
    try {
      // Vérifier que l'utilisateur a acheté le produit
      const order = await prisma.order.findFirst({
        where: {
          userId: userId,
          status: 'PAID',
          items: {
            some: {
              productId: productId
            }
          }
        },
        include: {
          items: {
            where: { productId: productId }
          }
        }
      });

      if (!order) {
        throw createError.forbidden('Vous devez avoir acheté ce produit pour le télécharger');
      }

      // Récupérer les informations du produit
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { fileUrl: true, title: true, fileType: true }
      });

      if (!product) {
        throw createError.notFound('Produit non trouvé');
      }

      // Vérifier si le fileUrl est un exemple et le remplacer temporairement
      let actualFileUrl = product.fileUrl;
      if (actualFileUrl.includes('example.com') || actualFileUrl.includes('placeholder')) {
        // Pour les tests, utiliser un fichier de test
        actualFileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      }

      // Créer un token de téléchargement
      const downloadToken: DownloadToken = {
        productId,
        userId,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 heures
        downloadCount: 0
      };

      // Encoder le token en base64
      const tokenString = Buffer.from(JSON.stringify(downloadToken)).toString('base64');

      // Générer l'URL signée avec ImageKit
      const signedUrl = imagekit.url({
        path: actualFileUrl,
        signed: true,
        expireSeconds: 86400, // 24 heures
        transformation: [{
          height: 300,
          crop: 'scale'
        }]
      });

      // Retourner l'URL avec le token
      return `${signedUrl}&token=${tokenString}`;
    } catch (error) {
      throw error;
    }
  }

  // Valider et traiter un téléchargement
  static async processDownload(token: string): Promise<{ fileUrl: string; fileName: string }> {
    try {
      // Décoder le token
      const decodedToken: DownloadToken = JSON.parse(
        Buffer.from(token, 'base64').toString()
      );

      // Vérifier l'expiration
      if (Date.now() > decodedToken.expiresAt) {
        throw createError.unauthorized('Lien de téléchargement expiré');
      }

      // Vérifier le nombre de téléchargements
      if (decodedToken.downloadCount >= 3) {
        throw createError.forbidden('Limite de téléchargements atteinte');
      }

      // Récupérer le produit
      const product = await prisma.product.findUnique({
        where: { id: decodedToken.productId },
        select: { fileUrl: true, title: true, fileType: true }
      });

      if (!product) {
        throw createError.notFound('Produit non trouvé');
      }

      // Incrémenter le compteur de téléchargements
      decodedToken.downloadCount++;

      // Mettre à jour les statistiques du produit
      await prisma.product.update({
        where: { id: decodedToken.productId },
        data: {
          downloadsCount: {
            increment: 1
          }
        }
      });

      // Générer le nom de fichier
      const fileName = `${product.title}.${product.fileType}`;

      return {
        fileUrl: product.fileUrl,
        fileName
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtenir l'historique des téléchargements d'un utilisateur
  static async getUserDownloadHistory(userId: string) {
    try {
      const downloads = await prisma.order.findMany({
        where: {
          userId: userId,
          status: 'PAID'
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  thumbnailUrl: true,
                  fileType: true,
                  downloadsCount: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return downloads;
    } catch (error) {
      throw error;
    }
  }

  // Vérifier si un utilisateur peut télécharger un produit
  static async canDownload(productId: string, userId: string): Promise<boolean> {
    try {
      const order = await prisma.order.findFirst({
        where: {
          userId: userId,
          status: 'PAID',
          items: {
            some: {
              productId: productId
            }
          }
        }
      });

      return !!order;
    } catch (error) {
      return false;
    }
  }

  // Obtenir les statistiques de téléchargement pour un vendeur
  static async getSellerDownloadStats(sellerId: string) {
    try {
      const stats = await prisma.product.aggregate({
        where: {
          userId: sellerId
        },
        _sum: {
          downloadsCount: true
        },
        _count: {
          id: true
        }
      });

      const topProducts = await prisma.product.findMany({
        where: {
          userId: sellerId
        },
        select: {
          id: true,
          title: true,
          downloadsCount: true,
          price: true
        },
        orderBy: {
          downloadsCount: 'desc'
        },
        take: 10
      });

      return {
        totalDownloads: stats._sum.downloadsCount || 0,
        totalProducts: stats._count.id,
        topProducts
      };
    } catch (error) {
      throw error;
    }
  }
}
