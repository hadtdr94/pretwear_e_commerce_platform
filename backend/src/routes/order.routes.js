import { Router } from 'express';
import { authenticate, optionalAuth, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validators.js';
import * as ctrl from '../controllers/order.controller.js';

const router = Router();

router.post('/', optionalAuth, validate(createOrderSchema), ctrl.createOrder);
router.get('/mine', authenticate, ctrl.getMyOrders);
router.get('/reference/:reference', optionalAuth, ctrl.getOrderByReference);
router.get('/', authenticate, authorize('ADMIN', 'MANAGER'), ctrl.listOrders);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'MANAGER'), validate(updateOrderStatusSchema), ctrl.updateOrderStatus);

export default router;
