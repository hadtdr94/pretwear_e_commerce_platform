import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addCartItemSchema, updateCartItemSchema } from '../validators/cart.validators.js';
import * as ctrl from '../controllers/cart.controller.js';

const router = Router();

router.use(optionalAuth);
router.get('/', ctrl.getCart);
router.post('/items', validate(addCartItemSchema), ctrl.addItem);
router.put('/items/:itemId', validate(updateCartItemSchema), ctrl.updateItem);
router.delete('/items/:itemId', ctrl.removeItem);
router.delete('/', ctrl.clearCart);

export default router;
