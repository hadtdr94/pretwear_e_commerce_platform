import { Router } from 'express';
import { authenticate, optionalAuth, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import { customizationSchema, updateCustomizationStatusSchema, quoteSchema } from '../validators/customization.validators.js';
import * as ctrl from '../controllers/customization.controller.js';

const router = Router();

router.post('/', optionalAuth, upload.array('attachments', 5), validate(customizationSchema), ctrl.createRequest);
router.get('/mine', authenticate, ctrl.getMyRequests);
router.get('/', authenticate, authorize('ADMIN', 'MANAGER'), ctrl.listRequests);
router.get('/:id', optionalAuth, ctrl.getRequest);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'MANAGER'), validate(updateCustomizationStatusSchema), ctrl.updateStatus);
router.post('/:id/quotes', authenticate, authorize('ADMIN', 'MANAGER'), validate(quoteSchema), ctrl.addQuote);

export default router;
