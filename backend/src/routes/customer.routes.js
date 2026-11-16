import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as ctrl from '../controllers/customer.controller.js';

const router = Router();
router.use(authenticate, authorize('ADMIN', 'MANAGER'));
router.get('/', ctrl.listCustomers);

export default router;
