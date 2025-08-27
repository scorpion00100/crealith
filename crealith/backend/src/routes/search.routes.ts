import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';

const router = Router();
const searchController = new SearchController();

// GET /api/search - Recherche de produits
router.get('/', searchController.searchProducts);

// GET /api/search/suggestions - Suggestions de recherche
router.get('/suggestions', searchController.getSearchSuggestions);

// GET /api/search/popular - Recherches populaires
router.get('/popular', searchController.getPopularSearches);

// GET /api/search/related/:productId - Produits similaires
router.get('/related/:productId', searchController.getRelatedProducts);

export default router;
