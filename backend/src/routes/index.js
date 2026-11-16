import { Router } from 'express';
import authRoutes from './auth.routes.js';
import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import customizationRoutes from './customization.routes.js';
import customerRoutes from './customer.routes.js';
import adminRoutes from './admin.routes.js';
import deliveryZoneRoutes from './deliveryZone.routes.js';
import settingsRoutes from './settings.routes.js';
import sizeColorRoutes from './sizeColor.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/customization', customizationRoutes);
router.use('/customers', customerRoutes);
router.use('/admin', adminRoutes);
router.use('/delivery-zones', deliveryZoneRoutes);
router.use('/settings', settingsRoutes);
router.use('/attributes', sizeColorRoutes);

export default router;
