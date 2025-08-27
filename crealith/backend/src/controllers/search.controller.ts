import { Request, Response } from 'express';
import { SearchService, SearchFilters } from '../services/search.service';

export class SearchController {
  private searchService: SearchService;

  constructor() {
    this.searchService = new SearchService();
  }

  searchProducts = async (req: Request, res: Response) => {
    try {
      const filters: SearchFilters = {
        query: req.query.query as string,
        category: req.query.category as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        rating: req.query.rating ? parseInt(req.query.rating as string) : undefined,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 12
      };

      const result = await this.searchService.searchProducts(filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  getSearchSuggestions = async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 2) {
        return res.json({
          success: true,
          data: []
        });
      }

      const suggestions = await this.searchService.getSearchSuggestions(query);
      
      res.json({
        success: true,
        data: suggestions
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  getPopularSearches = async (req: Request, res: Response) => {
    try {
      const searches = await this.searchService.getPopularSearches();
      
      res.json({
        success: true,
        data: searches
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  getRelatedProducts = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const products = await this.searchService.getRelatedProducts(productId);
      
      res.json({
        success: true,
        data: products
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
}
