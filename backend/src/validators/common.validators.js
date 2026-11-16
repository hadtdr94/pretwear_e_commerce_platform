import { z } from 'zod';

export const deliveryZoneSchema = z.object({
  wilaya: z.string().min(1),
  commune: z.string().optional().nullable(),
  fee: z.coerce.number().int().nonnegative(),
  isActive: z.boolean().optional(),
  etaMinDays: z.coerce.number().int().optional().nullable(),
  etaMaxDays: z.coerce.number().int().optional().nullable(),
});

export const settingsSchema = z.object({
  businessName: z.string().optional(),
  slogan: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  currency: z.string().optional(),
  socialLinks: z.any().optional(),
  content: z.any().optional(),
});
