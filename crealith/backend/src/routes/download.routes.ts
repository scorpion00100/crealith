import { Router } from 'express';
import { DownloadController } from '../controllers/download.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Routes protégées par authentification
router.use(authenticateToken);

// Générer une URL de téléchargement sécurisée
router.get('/generate/:productId', DownloadController.generateDownloadUrl);

// Vérifier les permissions de téléchargement
router.get('/check/:productId', DownloadController.checkDownloadPermission);

// Obtenir l'historique des téléchargements
router.get('/history', DownloadController.getDownloadHistory);

// Obtenir les statistiques de téléchargement (vendeurs uniquement)
router.get('/stats', requireRole(['SELLER', 'ADMIN']), DownloadController.getSellerDownloadStats);

// Téléchargement direct (admin ou propriétaire)
router.get('/direct/:productId', DownloadController.directDownload);

// Traiter un téléchargement (public - avec token)
router.get('/process/:token', DownloadController.processDownload);

export default router;
