import { Request, Response } from 'express';
import { DownloadService } from '../services/download.service';
import { createError } from '../utils/errors';

export class DownloadController {
  // Générer une URL de téléchargement sécurisée
  static async generateDownloadUrl(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const userId = req.user!.userId;

      const downloadUrl = await DownloadService.generateSecureDownloadUrl(
        productId,
        userId
      );

      res.json({
        success: true,
        data: {
          downloadUrl,
          expiresIn: '24h',
          maxDownloads: 3
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erreur interne du serveur'
        });
      }
    }
  }

  // Traiter un téléchargement
  static async processDownload(req: Request, res: Response) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token de téléchargement requis'
        });
      }

      const downloadData = await DownloadService.processDownload(token);

      res.json({
        success: true,
        data: downloadData
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erreur interne du serveur'
        });
      }
    }
  }

  // Obtenir l'historique des téléchargements
  static async getDownloadHistory(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const downloads = await DownloadService.getUserDownloadHistory(userId);

      res.json({
        success: true,
        data: downloads
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique'
      });
    }
  }

  // Vérifier si un utilisateur peut télécharger un produit
  static async checkDownloadPermission(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const userId = req.user!.userId;

      const canDownload = await DownloadService.canDownload(productId, userId);

      res.json({
        success: true,
        data: {
          canDownload,
          productId
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification des permissions'
      });
    }
  }

  // Obtenir les statistiques de téléchargement pour un vendeur
  static async getSellerDownloadStats(req: Request, res: Response) {
    try {
      const sellerId = req.user!.userId;
      const stats = await DownloadService.getSellerDownloadStats(sellerId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  }

  // Télécharger directement un fichier (pour les admins)
  static async directDownload(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const userId = req.user!.userId;

      // Vérifier que l'utilisateur est admin ou propriétaire du produit
      if (req.user!.role !== 'ADMIN') {
        // Vérifier la propriété du produit
        const canDownload = await DownloadService.canDownload(productId, userId);
        if (!canDownload) {
          return res.status(403).json({
            success: false,
            message: 'Permissions insuffisantes'
          });
        }
      }

      const downloadUrl = await DownloadService.generateSecureDownloadUrl(
        productId,
        userId
      );

      res.json({
        success: true,
        data: {
          downloadUrl
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erreur interne du serveur'
        });
      }
    }
  }
}
