import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { cartService } from '../services/cart.service';
import { validate, addToCartSchema, updateCartItemSchema, idParamSchema } from '../utils/validation';

const router = Router();

router.use(authenticateToken);

router.get('/', async (req: any, res, next) => {
  try {
    const items = await cartService.getCart(req.user.userId);
    res.json({ success: true, data: items });
  } catch (e) { next(e); }
});

router.post('/', validate(addToCartSchema), async (req: any, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const item = await cartService.addToCart(req.user.userId, productId, quantity);
    res.json({ success: true, data: item });
  } catch (e: any) {
    if (e.statusCode === 404) return res.status(404).json({ success: false, message: e.message });
    next(e);
  }
});

router.put('/:id', validate(idParamSchema, 'params'), validate(updateCartItemSchema), async (req: any, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const item = await cartService.updateItem(req.user.userId, id, quantity);
    res.json({ success: true, data: item });
  } catch (e: any) {
    if (e.removed && e.statusCode === 204) return res.status(200).json({ success: true, data: null });
    if (e.statusCode === 404) return res.status(404).json({ success: false, message: e.message });
    next(e);
  }
});

router.delete('/:id', validate(idParamSchema, 'params'), async (req: any, res, next) => {
  try {
    const { id } = req.params;
    await cartService.removeItem(req.user.userId, id);
    res.json({ success: true });
  } catch (e) { next(e); }
});

router.delete('/', async (req: any, res, next) => {
  try {
    await cartService.clear(req.user.userId);
    res.json({ success: true });
  } catch (e) { next(e); }
});

export default router;


