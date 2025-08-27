import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import reviewRoutes from './review.routes';
import favoriteRoutes from './favorites.routes';
import notificationRoutes from './notification.routes';
import analyticsRoutes from './analytics.routes';
import searchRoutes from './search.routes';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Crealith API is running',
    version: '1.0.0',
            endpoints: {
          auth: '/api/auth',
          products: '/api/products',
          orders: '/api/orders',
          reviews: '/api/reviews',
          favorites: '/api/favorites',
          notifications: '/api/notifications',
          analytics: '/api/analytics',
          search: '/api/search'
        }
  });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/search', searchRoutes);

export default router;
