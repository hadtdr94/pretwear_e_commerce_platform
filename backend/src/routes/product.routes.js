import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { productSchema, productUpdateSchema } from '../validators/product.validators.js';
import * as ctrl from '../controllers/product.controller.js';

const router = Router();

router.get('/', ctrl.listProducts);
router.get('/:idOrSlug', ctrl.getProduct);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), validate(productSchema), ctrl.createProduct);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(productUpdateSchema), ctrl.updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), ctrl.deleteProduct);

export default router;
