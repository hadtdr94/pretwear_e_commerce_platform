import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as ctrl from '../controllers/admin.controller.js';

const router = Router();
router.use(authenticate, authorize('ADMIN', 'MANAGER'));
router.get('/dashboard', ctrl.dashboard);

export default router;
