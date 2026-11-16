import { z } from 'zod';

export const customizationSchema = z.object({
  customerName: z.string().min(1),
  phone: z.string().min(5),
  email: z.string().email().optional().nullable().or(z.literal('')),
  customerType: z.enum(['INDIVIDUAL', 'COMPANY']),
  productType: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  sizes: z.string().optional().nullable(),
  colors: z.string().optional().nullable(),
  technique: z.string().min(1),
  description: z.string().min(1),
  wilaya: z.string().min(1),
});

export const updateCustomizationStatusSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'QUOTED', 'APPROVED', 'IN_PRODUCTION', 'COMPLETED', 'REJECTED', 'CANCELLED']),
  adminNotes: z.string().optional().nullable(),
});

export const quoteSchema = z.object({
  amount: z.coerce.number().int().nonnegative(),
  currency: z.string().optional().default('DZD'),
  note: z.string().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
});
