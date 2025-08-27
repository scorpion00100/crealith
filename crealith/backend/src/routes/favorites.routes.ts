import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { FavoriteController } from '../controllers/favorite.controller';

const router = Router();
const favoriteController = new FavoriteController();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/favorites - Récupérer les favoris de l'utilisateur
router.get('/', favoriteController.getUserFavorites);

// POST /api/favorites - Ajouter un produit aux favoris
router.post('/', favoriteController.addToFavorites);

// DELETE /api/favorites/:productId - Retirer un produit des favoris
router.delete('/:productId', favoriteController.removeFromFavorites);

// GET /api/favorites/check/:productId - Vérifier si un produit est en favori
router.get('/check/:productId', favoriteController.checkIfFavorite);

export default router;
