import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { createError } from '../utils/errors';

const productService = new ProductService();

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files || !req.files.file) {
      throw createError.badRequest('Product file is required');
    }

    const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;
    const thumbnail = req.files.thumbnail ? (Array.isArray(req.files.thumbnail) ? req.files.thumbnail[0] : req.files.thumbnail) : undefined;

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
      userId: req.user!.id,
    };

    const product = await productService.createProduct(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      categoryId: req.query.categoryId as string,
      search: req.query.search as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      isFeatured: req.query.isFeatured === 'true',
      isActive: req.query.isActive !== 'false', // Par défaut true
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 12,
      sortBy: req.query.sortBy as 'price' | 'createdAt' | 'downloadsCount' | 'rating',
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await productService.getProducts(filters);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

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

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updateData: any = {};
    
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

    if (req.files?.file) {
      updateData.file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;
    }
    if (req.files?.thumbnail) {
      updateData.thumbnail = Array.isArray(req.files.thumbnail) ? req.files.thumbnail[0] : req.files.thumbnail;
    }

    const product = await productService.updateProduct(req.params.id, req.user!.id, updateData);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productService.deleteProduct(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getUserProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await productService.getProductsByUser(req.user!.id);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const downloadProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      throw createError.notFound('Product not found');
    }

    // Vérifier si l'utilisateur a acheté le produit
    const hasPurchased = await productService.hasUserPurchased(req.user!.id, req.params.id);
    if (!hasPurchased && product.userId !== req.user!.id) {
      throw createError.forbidden('You must purchase this product to download it');
    }

    // Incrémenter le compteur de téléchargements
    await productService.incrementDownloads(req.params.id);

    res.json({ success: true, data: { downloadUrl: product.fileUrl } });
  } catch (error) {
    next(error);
  }
};
