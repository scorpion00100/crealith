import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { createError } from '../utils/errors';



const productService = new ProductService();

/**
 * Crée un produit pour l'utilisateur authentifié.
 * Gère les fichiers optionnels (file/thumbnail) et parse les champs numériques/JSON.
 */
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as any;
    
    // Rendre le fichier optionnel pour les tests
    const file = files?.file ? (Array.isArray(files.file) ? files.file[0] : files.file) : undefined;
    const thumbnail = files?.thumbnail ? (Array.isArray(files.thumbnail) ? files.thumbnail[0] : files.thumbnail) : undefined;

    const user = req.user as any;
    const productData = {
      title: req.body.title,
      description: req.body.description,
      shortDescription: req.body.shortDescription,
      price: parseFloat(req.body.price),
      originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : undefined,
      file,
      thumbnail,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      categoryId: req.body.categoryId,
      userId: user.userId,
    };

    const product = await productService.createProduct(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * Liste paginée/triée des produits avec filtres (catégorie, prix, recherche, userId sécurisé).
 */
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    
    // Si userId est fourni dans la query, vérifier les permissions
    let userIdFilter: string | undefined = undefined;
    if (req.query.userId) {
      const requestedUserId = req.query.userId as string;
      
      // Seul l'utilisateur lui-même peut filtrer par son userId (sauf ADMIN)
      if (user && (user.role === 'ADMIN' || user.userId === requestedUserId)) {
        userIdFilter = requestedUserId;
      } else if (!user) {
        // Utilisateur non authentifié ne peut pas filtrer par userId
        userIdFilter = undefined;
      } else {
        // Utilisateur authentifié essaie de voir les produits d'un autre
        throw createError.forbidden('Vous ne pouvez voir que vos propres produits');
      }
    }
    
    const filters = {
      categoryId: req.query.categoryId as string,
      search: req.query.search as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      isFeatured: req.query.isFeatured === 'true',
      isActive: req.query.isActive !== 'false', // Par défaut true
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 12,
      sortBy: req.query.sortBy as 'price' | 'createdAt' | 'downloadsCount',
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
      userId: userIdFilter, // ✅ Filtre par userId sécurisé
    };

    const result = await productService.getProducts(filters);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère un produit par id, 404 si non trouvé.
 */
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      throw createError.notFound('Product not found');
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * Met à jour un produit appartenant à l'utilisateur (ou admin).
 * Supporte champs partiels et fichiers.
 */
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updateData: any = {};
    const files = req.files as any;
    const user = req.user as any;
    
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.shortDescription !== undefined) updateData.shortDescription = req.body.shortDescription;
    if (req.body.price) updateData.price = parseFloat(req.body.price);
    if (req.body.originalPrice !== undefined) {
      updateData.originalPrice = req.body.originalPrice ? parseFloat(req.body.originalPrice) : null;
    }
    if (req.body.tags) updateData.tags = JSON.parse(req.body.tags);
    if (req.body.categoryId) updateData.categoryId = req.body.categoryId;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive === 'true';
    if (req.body.isFeatured !== undefined) updateData.isFeatured = req.body.isFeatured === 'true';

    if (files?.file) {
      updateData.file = Array.isArray(files.file) ? files.file[0] : files.file;
    }
    if (files?.thumbnail) {
      updateData.thumbnail = Array.isArray(files.thumbnail) ? files.thumbnail[0] : files.thumbnail;
    }

    const product = await productService.updateProduct(req.params.id, user.userId, updateData);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprime un produit (propriétaire ou admin).
 */
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    await productService.deleteProduct(req.params.id, user.userId);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupère les produits de l'utilisateur courant.
 */
export const getUserProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const products = await productService.getProductsByUser(user.userId);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

/**
 * Renvoie une URL de téléchargement si l'utilisateur a acheté le produit
 * (ou s'il est propriétaire). Incrémente le compteur de téléchargements.
 */
export const downloadProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      throw createError.notFound('Product not found');
    }

    // Vérifier si l'utilisateur a acheté le produit
    const hasPurchased = await productService.hasUserPurchased(user.userId, req.params.id);
    if (!hasPurchased && product.userId !== user.userId) {
      throw createError.forbidden('You must purchase this product to download it');
    }

    // Incrémenter le compteur de téléchargements
    await productService.incrementDownloads(req.params.id);

    res.json({ success: true, data: { downloadUrl: product.fileUrl } });
  } catch (error) {
    next(error);
  }
};

/**
 * Restaurer un produit soft-deleted
 */
export const restoreProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    const product = await productService.restoreProduct(req.params.id, user.userId);
    res.json({ success: true, data: product, message: 'Product restored successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Hard delete permanent d'un produit (admin seulement)
 */
export const hardDeleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productService.hardDeleteProduct(req.params.id);
    res.json({ success: true, message: 'Product permanently deleted' });
  } catch (error) {
    next(error);
  }
};
