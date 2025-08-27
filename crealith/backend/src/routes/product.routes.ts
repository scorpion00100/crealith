import { Router } from 'express';
import multer from 'multer';
import * as productController from '../controllers/product.controller';
import { requireAuth, requireSeller, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Configuration multer pour l'upload de fichiers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: (req, file, cb) => {
    // Accepter tous les types de fichiers pour les produits numériques
    cb(null, true);
  },
});

// Routes publiques
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Routes protégées
router.use(requireAuth);

// Routes pour les vendeurs
router.post('/', requireSeller, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), productController.createProduct);

router.put('/:id', requireSeller, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), productController.updateProduct);

router.delete('/:id', requireSeller, productController.deleteProduct);
router.get('/user/products', requireSeller, productController.getUserProducts);

// Route de téléchargement
router.post('/:id/download', productController.downloadProduct);

export default router;
