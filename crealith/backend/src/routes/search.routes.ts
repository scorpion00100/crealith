import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { validate, searchQuerySchema, idParamSchema } from '../utils/validation';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const searchController = new SearchController();

// Rate limiting pour éviter l'abus de recherche
const searchRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requêtes par minute
  message: 'Trop de recherches. Veuillez réessayer dans une minute.',
  standardHeaders: true,
  legacyHeaders: false,
});

// GET /api/search - Recherche de produits
router.get('/', searchRateLimit, validate(searchQuerySchema, 'query'), searchController.searchProducts);

// GET /api/search/suggestions - Suggestions de recherche
router.get('/suggestions', searchRateLimit, searchController.getSearchSuggestions);

// GET /api/search/popular - Recherches populaires
router.get('/popular', searchController.getPopularSearches);

// GET /api/search/related/:productId - Produits similaires
router.get('/related/:productId', validate(idParamSchema, 'params'), searchController.getRelatedProducts);

export default router;
