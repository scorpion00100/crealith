import { Router, Request, Response } from 'express';
import multer from 'multer';
import { ImageKitService } from '../services/imagekit.service';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Configuration multer pour l'upload de fichiers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// Route pour obtenir le token d'authentification ImageKit
router.get('/auth', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const authToken = ImageKitService.generateAuthToken(userId);
    
    res.json(authToken);
  } catch (error) {
    console.error('ImageKit auth error:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du token d\'authentification' });
  }
});

// Route pour uploader une image via le backend
router.post('/upload', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const { folder = '/crealith/products', tags = 'product' } = req.body;
    const tagsArray = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;

    const result = await ImageKitService.uploadImage(
      req.file.buffer,
      req.file.originalname,
      folder,
      tagsArray
    );

    res.json(result);
  } catch (error) {
    console.error('ImageKit upload error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de l\'image' });
  }
});

// Route pour supprimer une image
router.delete('/delete/:fileId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    await ImageKitService.deleteImage(fileId);
    
    res.json({ success: true, message: 'Image supprimée avec succès' });
  } catch (error) {
    console.error('ImageKit delete error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'image' });
  }
});

// Route pour obtenir les détails d'une image
router.get('/details/:fileId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const details = await ImageKitService.getImageDetails(fileId);
    
    res.json(details);
  } catch (error) {
    console.error('ImageKit get details error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des détails de l\'image' });
  }
});

// Route pour lister les images dans un dossier
router.get('/list', requireAuth, async (req: Request, res: Response) => {
  try {
    const { folder = '/crealith/products', limit = 100, skip = 0 } = req.query;
    const images = await ImageKitService.listImages(
      folder as string,
      parseInt(limit as string),
      parseInt(skip as string)
    );
    
    res.json(images);
  } catch (error) {
    console.error('ImageKit list error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des images' });
  }
});

// Route pour créer un dossier
router.post('/folder', requireAuth, async (req: Request, res: Response) => {
  try {
    const { folderName, parentFolderPath = '/' } = req.body;
    
    if (!folderName) {
      return res.status(400).json({ error: 'Nom du dossier requis' });
    }

    const result = await ImageKitService.createFolder(folderName, parentFolderPath);
    res.json(result);
  } catch (error) {
    console.error('ImageKit create folder error:', error);
    res.status(500).json({ error: 'Erreur lors de la création du dossier' });
  }
});

// Route pour supprimer un dossier
router.delete('/folder', requireAuth, async (req: Request, res: Response) => {
  try {
    const { folderPath } = req.body;
    
    if (!folderPath) {
      return res.status(400).json({ error: 'Chemin du dossier requis' });
    }

    await ImageKitService.deleteFolder(folderPath);
    res.json({ success: true, message: 'Dossier supprimé avec succès' });
  } catch (error) {
    console.error('ImageKit delete folder error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du dossier' });
  }
});

// Route pour obtenir les métadonnées d'une image
router.get('/metadata/:fileId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const metadata = await ImageKitService.getImageMetadata(fileId);
    
    res.json(metadata);
  } catch (error) {
    console.error('ImageKit get metadata error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des métadonnées' });
  }
});

// Route pour mettre à jour les métadonnées d'une image
router.put('/metadata/:fileId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const { tags, customMetadata } = req.body;
    
    const result = await ImageKitService.updateImageMetadata(fileId, tags, customMetadata);
    res.json(result);
  } catch (error) {
    console.error('ImageKit update metadata error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des métadonnées' });
  }
});

// Route pour générer une URL d'image avec transformations
router.post('/url', requireAuth, async (req: Request, res: Response) => {
  try {
    const { imagePath, transformations } = req.body;
    
    if (!imagePath) {
      return res.status(400).json({ error: 'Chemin de l\'image requis' });
    }

    const url = ImageKitService.generateImageUrl(imagePath, transformations);
    res.json({ url });
  } catch (error) {
    console.error('ImageKit URL generation error:', error);
    res.status(500).json({ error: 'Erreur lors de la génération de l\'URL' });
  }
});

// Route pour purger le cache d'une image
router.post('/purge-cache', requireAuth, async (req: Request, res: Response) => {
  try {
    const { imagePath } = req.body;
    
    if (!imagePath) {
      return res.status(400).json({ error: 'Chemin de l\'image requis' });
    }

    await ImageKitService.purgeImageCache(imagePath);
    res.json({ success: true, message: 'Cache purgé avec succès' });
  } catch (error) {
    console.error('ImageKit purge cache error:', error);
    res.status(500).json({ error: 'Erreur lors de la purge du cache' });
  }
});

export default router;
