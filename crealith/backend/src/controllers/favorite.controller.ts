import { Request, Response } from 'express';
import { FavoriteService } from '../services/favorite.service';

export class FavoriteController {
  private favoriteService: FavoriteService;

  constructor() {
    this.favoriteService = new FavoriteService();
  }

  getUserFavorites = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const favorites = await this.favoriteService.getUserFavorites(userId);
      
      res.json({
        success: true,
        data: favorites
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  addToFavorites = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
      }

      const favorite = await this.favoriteService.addToFavorites(userId, productId);
      
      res.json({
        success: true,
        data: favorite
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  removeFromFavorites = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { productId } = req.params;

      await this.favoriteService.removeFromFavorites(userId, productId);
      
      res.json({
        success: true,
        message: 'Product removed from favorites'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  checkIfFavorite = async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { productId } = req.params;

      const isFavorite = await this.favoriteService.isFavorite(userId, productId);
      
      res.json({
        success: true,
        data: { isFavorite }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
}
