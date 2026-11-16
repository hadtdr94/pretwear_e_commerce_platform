import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { categorySchema, categoryUpdateSchema } from '../validators/category.validators.js';
import * as ctrl from '../controllers/category.controller.js';

const router = Router();

router.get('/', ctrl.listCategories);
router.get('/:idOrSlug', ctrl.getCategory);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), validate(categorySchema), ctrl.createCategory);
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), validate(categoryUpdateSchema), ctrl.updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), ctrl.deleteCategory);

export default router;
