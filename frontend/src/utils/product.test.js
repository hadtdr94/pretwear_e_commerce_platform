import { describe, it, expect } from 'vitest';
import { normalizeProduct, normalizeCart } from './product';

describe('normalizeProduct', () => {
  it('normalizes nested API product shape', () => {
    const p = normalizeProduct({
      id: 'p1',
      name: 'Tee',
      basePrice: 2000,
      isCustomizable: true,
      category: { name: 'T-Shirts', slug: 't-shirts' },
      images: [{ url: '/img.png' }],
      variants: [{ id: 'v1', sku: 'S1', color: { name: 'Noir' }, size: { name: 'M' }, inventory: { quantity: 3 }, price: 2000 }],
    });
    expect(p.category).toBe('T-Shirts');
    expect(p.images[0]).toBe('/img.png');
    expect(p.variants[0].color).toBe('Noir');
    expect(p.variants[0].stock).toBe(3);
    expect(p.customizable).toBe(true);
  });
});

describe('normalizeCart', () => {
  it('normalizes cart items and totals', () => {
    const c = normalizeCart({
      subtotal: 4000,
      items: [{ id: 'i1', quantity: 2, unitPrice: 2000, product: { name: 'Tee', images: [{ url: '/x' }] }, variant: { color: { name: 'Noir' }, size: { name: 'M' }, inventory: { quantity: 5 } } }],
    });
    expect(c.count).toBe(2);
    expect(c.items[0].name).toBe('Tee');
    expect(c.items[0].color).toBe('Noir');
  });
});
