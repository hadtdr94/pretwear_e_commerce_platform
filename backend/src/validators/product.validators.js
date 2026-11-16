import { z } from 'zod';

const variantSchema = z.object({
  sizeId: z.string().optional().nullable(),
  colorId: z.string().optional().nullable(),
  sku: z.string().min(1),
  price: z.number().int().nonnegative().optional().nullable(),
  salePrice: z.number().int().nonnegative().optional().nullable(),
  isActive: z.boolean().optional(),
  stock: z.number().int().nonnegative().optional().default(0),
  lowStock: z.number().int().nonnegative().optional().default(5),
});

const imageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
});

export const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  basePrice: z.number().int().nonnegative(),
  salePrice: z.number().int().nonnegative().optional().nullable(),
  categoryId: z.string().min(1),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isCustomizable: z.boolean().optional(),
  images: z.array(imageSchema).optional().default([]),
  variants: z.array(variantSchema).min(1),
});

export const productUpdateSchema = productSchema.partial();
