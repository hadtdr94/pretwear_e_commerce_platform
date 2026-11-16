import { z } from 'zod';

export const addCartItemSchema = z.object({
  sessionId: z.string().optional(),
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

export const updateCartItemSchema = z.object({
  sessionId: z.string().optional(),
  quantity: z.number().int().positive(),
});
