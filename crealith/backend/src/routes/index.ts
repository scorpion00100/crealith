import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Crealith API is running',
    version: '1.0.0',
    endpoints: { auth: '/api/auth' }
  });
});

router.use('/auth', authRoutes);

export default router;
