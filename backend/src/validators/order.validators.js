import { z } from 'zod';

export const createOrderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(5),
  customerEmail: z.string().email().optional().nullable(),
  wilaya: z.string().min(1),
  commune: z.string().min(1),
  address: z.string().min(1),
  notes: z.string().optional().nullable(),
  paymentMethod: z.enum(['COD', 'OTHER']).optional().default('COD'),
  sessionId: z.string().optional(),
  items: z.array(z.object({
    variantId: z.string().min(1),
    quantity: z.number().int().positive(),
  })).min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});
