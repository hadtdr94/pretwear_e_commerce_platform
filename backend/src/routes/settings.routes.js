import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { settingsSchema } from '../validators/common.validators.js';
import * as ctrl from '../controllers/settings.controller.js';

const router = Router();
router.get('/', ctrl.getSettings);
router.put('/', authenticate, authorize('ADMIN', 'MANAGER'), validate(settingsSchema), ctrl.updateSettings);

export default router;
