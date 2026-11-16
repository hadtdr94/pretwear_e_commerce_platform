export function normalizeProduct(p) {
  if (!p) return null;
  const images = Array.isArray(p.images)
    ? p.images.map((img) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
    : [];
  const variants = Array.isArray(p.variants)
    ? p.variants.map((v) => ({
        ...v,
        color: typeof v.color === 'string' ? v.color : v.color?.name || 'Default',
        size: typeof v.size === 'string' ? v.size : v.size?.name || 'Default',
        colorId: v.colorId || v.color?.id || null,
        sizeId: v.sizeId || v.size?.id || null,
        stock: v.stock ?? v.inventory?.quantity ?? 0,
        price: v.salePrice ?? v.price ?? p.salePrice ?? p.basePrice ?? p.price ?? 0,
      }))
    : [];

  const colors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean)));
  const sizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)));
  const inStock = variants.some((v) => (v.stock ?? 0) > 0);
  const badges = [];
  if (p.isFeatured) badges.push('Featured');
  if (p.salePrice) badges.push('Sale');
  if (p.isCustomizable) badges.push('Custom');

  return {
    ...p,
    category: typeof p.category === 'string' ? p.category : p.category?.name || 'Catalog',
    categorySlug: typeof p.category === 'object' ? p.category?.slug : p.categorySlug,
    categoryId: p.categoryId || p.category?.id || p.categoryId,
    price: p.basePrice ?? p.price ?? 0,
    salePrice: p.salePrice ?? null,
    images: images.length ? images : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop'],
    variants,
    colors: colors.length ? colors : (p.colors || []),
    sizes: sizes.length ? sizes : (p.sizes || []),
    badges: p.badges || badges,
    specs: p.specs || [
      p.isCustomizable ? 'Customization-ready base (DTF/Embroidery)' : 'Standard product',
      inStock ? 'In stock (per variant)' : 'Availability varies',
      'Prices in DZD',
    ],
    customizable: p.isCustomizable ?? p.customizable ?? false,
    quoteOnly: p.quoteOnly ?? false,
  };
}

export function normalizeCart(cart) {
  if (!cart) return { items: [], subtotal: 0, count: 0 };
  const items = (cart.items || []).map((i) => {
    const variant = i.variant || {};
    const product = i.product || {};
    const img = Array.isArray(product.images) ? (product.images[0]?.url || product.images[0]) : (i.image || '');
    return {
      id: i.id,
      cartItemId: i.id,
      productId: i.productId || product.id,
      variantId: i.variantId || variant.id,
      name: product.name || i.productName || i.name || 'Product',
      price: i.unitPrice ?? i.price ?? 0,
      quantity: i.quantity || 1,
      image: typeof img === 'string' ? img : (img?.url || ''),
      color: variant.color?.name || i.color || 'Default',
      size: variant.size?.name || i.size || 'Default',
      stock: variant.inventory?.quantity ?? i.stock,
    };
  });
  const subtotal = cart.subtotal ?? items.reduce((s, i) => s + (Number(i.price) || 0) * i.quantity, 0);
  const count = cart.count ?? items.reduce((s, i) => s + i.quantity, 0);
  return { ...cart, items, subtotal, count };
}
