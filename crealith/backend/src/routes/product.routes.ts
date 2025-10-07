import { Router } from 'express';
import multer from 'multer';
import * as productController from '../controllers/product.controller';
import { requireAuth, requireSeller, requireAdmin, requireOwnership, optionalAuth } from '../middleware/auth.middleware';
import { validate, createProductSchema, updateProductSchema, productQuerySchema, idParamSchema } from '../utils/validation';
import { createError } from '../utils/errors';

const router = Router();

// Types MIME autorisés pour les uploads
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'video/mp4',
  'video/quicktime',
  'text/plain',
  'application/json',
  'application/javascript',
  'text/html',
  'text/css'
];

// Configuration multer pour l'upload de fichiers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: (req, file, cb) => {
    // Vérifier le type MIME
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non autorisé: ${file.mimetype}. Types acceptés: images, PDF, ZIP, vidéos, code source`));
    }
  },
});

// Routes publiques (avec authentification optionnelle pour filtrage userId)
router.get('/', optionalAuth, validate(productQuerySchema, 'query'), productController.getProducts);
router.get('/:id', validate(idParamSchema, 'params'), productController.getProductById);

// Routes protégées
router.use(requireAuth);

// Routes pour les vendeurs
router.post('/', requireSeller, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), validate(createProductSchema), productController.createProduct);

router.put('/:id', requireSeller, validate(idParamSchema, 'params'), requireOwnership('product'), upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), validate(updateProductSchema), productController.updateProduct);

router.delete('/:id', requireSeller, validate(idParamSchema, 'params'), requireOwnership('product'), productController.deleteProduct);

// Route de restauration (vendeur peut restaurer ses propres produits)
router.post('/:id/restore', requireSeller, validate(idParamSchema, 'params'), productController.restoreProduct);

// Route de suppression permanente (admin seulement)
router.delete('/:id/permanent', requireAdmin, validate(idParamSchema, 'params'), productController.hardDeleteProduct);

router.get('/user/products', requireSeller, productController.getUserProducts);

// Route de téléchargement
router.post('/:id/download', productController.downloadProduct);

export default router;
