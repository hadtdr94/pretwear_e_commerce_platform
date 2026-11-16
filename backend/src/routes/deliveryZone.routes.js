import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { deliveryZoneSchema } from '../validators/common.validators.js';
import * as ctrl from '../controllers/deliveryZone.controller.js';

const router = Router();
router.get('/', ctrl.listZones);
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), validate(deliveryZoneSchema), ctrl.upsertZone);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), ctrl.deleteZone);

export default router;
