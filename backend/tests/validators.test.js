import { describe, it, expect } from 'vitest';
import { createOrderSchema, updateOrderStatusSchema } from '../src/validators/order.validators.js';
import { productSchema } from '../src/validators/product.validators.js';

describe('order validators', () => {
  it('accepts a valid COD order payload', () => {
    const parsed = createOrderSchema.parse({
      customerName: 'Test User',
      customerPhone: '0550000000',
      wilaya: '16 - Alger',
      commune: 'Bab Ezzouar',
      address: 'Sample address',
      items: [{ variantId: 'var_1', quantity: 2 }],
    });
    expect(parsed.paymentMethod).toBe('COD');
    expect(parsed.items).toHaveLength(1);
  });

  it('rejects invalid order payloads', () => {
    expect(() => createOrderSchema.parse({ customerName: '', items: [] })).toThrow();
  });

  it('validates order status transitions input', () => {
    expect(updateOrderStatusSchema.parse({ status: 'CONFIRMED' }).status).toBe('CONFIRMED');
    expect(() => updateOrderStatusSchema.parse({ status: 'UNKNOWN' })).toThrow();
  });
});

describe('product validator', () => {
  it('accepts a valid product with variant', () => {
    const parsed = productSchema.parse({
      name: 'Sample Tee',
      slug: 'sample-tee',
      description: 'Demo',
      basePrice: 2500,
      categoryId: 'cat_1',
      variants: [{ sku: 'TEE-1', stock: 10 }],
    });
    expect(parsed.variants[0].stock).toBe(10);
  });

  it('rejects invalid slug or missing variants', () => {
    expect(() => productSchema.parse({ name: 'X', slug: 'Bad Slug', description: 'd', basePrice: 1, categoryId: 'c', variants: [{ sku: 'A' }] })).toThrow();
    expect(() => productSchema.parse({ name: 'X', slug: 'ok-slug', description: 'd', basePrice: 1, categoryId: 'c', variants: [] })).toThrow();
  });
});
