import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { getPagination, pagedMeta } from '../utils/pagination.js';

const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' } },
  variants: {
    include: { size: true, color: true, inventory: true },
    orderBy: { createdAt: 'asc' },
  },
};

export const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const { q, category, categoryId, size, color, minPrice, maxPrice, inStock, featured, customizable, sort, includeInactive } = req.query;

  const where = {};
  if (!(includeInactive === 'true')) where.isActive = true;
  if (featured === 'true') where.isFeatured = true;
  if (customizable === 'true') where.isCustomizable = true;

  if (categoryId) where.categoryId = categoryId;
  if (category) where.category = { OR: [{ slug: category }, { name: { equals: String(category), mode: 'insensitive' } }] };

  if (q) {
    where.OR = [
      { name: { contains: String(q), mode: 'insensitive' } },
      { description: { contains: String(q), mode: 'insensitive' } },
      { slug: { contains: String(q), mode: 'insensitive' } },
    ];
  }

  const priceFilter = {};
  if (minPrice) priceFilter.gte = parseInt(minPrice, 10);
  if (maxPrice) priceFilter.lte = parseInt(maxPrice, 10);
  if (Object.keys(priceFilter).length) where.basePrice = priceFilter;

  const variantSome = {};
  if (size) variantSome.size = { name: { equals: String(size), mode: 'insensitive' } };
  if (color) variantSome.color = { name: { equals: String(color), mode: 'insensitive' } };
  if (inStock === 'true') variantSome.inventory = { quantity: { gt: 0 } };
  if (Object.keys(variantSome).length) where.variants = { some: variantSome };

  let orderBy = { createdAt: 'desc' };
  if (sort === 'price-asc') orderBy = { basePrice: 'asc' };
  if (sort === 'price-desc') orderBy = { basePrice: 'desc' };
  if (sort === 'newest') orderBy = { createdAt: 'desc' };
  if (sort === 'name') orderBy = { name: 'asc' };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, include: productInclude, orderBy, skip, take }),
  ]);

  return ok(res, products, pagedMeta(total, page, limit));
});

export const getProduct = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const product = await prisma.product.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: { ...productInclude, reviews: { where: { isApproved: true }, orderBy: { createdAt: 'desc' }, take: 20 } },
  });
  if (!product) throw new ApiError(404, 'Product not found');
  if (!product.isActive && !(req.query.includeInactive === 'true')) throw new ApiError(404, 'Product not found');
  return ok(res, product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const { images = [], variants = [], ...data } = req.body;
  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({ data });
    if (images.length) {
      await tx.productImage.createMany({ data: images.map((img, i) => ({ ...img, productId: product.id, sortOrder: img.sortOrder ?? i })) });
    }
    for (const v of variants) {
      const { stock = 0, lowStock = 5, ...variantData } = v;
      const createdVariant = await tx.productVariant.create({ data: { ...variantData, productId: product.id } });
      await tx.inventory.create({ data: { variantId: createdVariant.id, quantity: stock, lowStock } });
    }
    return tx.product.findUnique({ where: { id: product.id }, include: productInclude });
  });
  return ok(res, result, undefined, 201);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Product not found');
  const { images, variants, ...data } = req.body;

  const result = await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data });

    if (Array.isArray(images)) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (images.length) {
        await tx.productImage.createMany({ data: images.map((img, i) => ({ ...img, productId: id, sortOrder: img.sortOrder ?? i })) });
      }
    }

    if (Array.isArray(variants)) {
      const existingVariants = await tx.productVariant.findMany({ where: { productId: id }, select: { id: true, sku: true } });
      const incomingSkus = new Set(variants.map((v) => v.sku));

      // For existing variants not in the incoming payload:
      for (const ev of existingVariants) {
        if (!incomingSkus.has(ev.sku)) {
          try {
            await tx.inventory.deleteMany({ where: { variantId: ev.id } });
            await tx.productVariant.delete({ where: { id: ev.id } });
          } catch {
            await tx.productVariant.update({ where: { id: ev.id }, data: { isActive: false } });
          }
        }
      }

      // Upsert / update incoming variants
      for (const v of variants) {
        const { stock = 0, lowStock = 5, ...variantData } = v;
        const existing = await tx.productVariant.findFirst({ where: { productId: id, sku: v.sku } });
        if (existing) {
          await tx.productVariant.update({ where: { id: existing.id }, data: variantData });
          await tx.inventory.upsert({
            where: { variantId: existing.id },
            update: { quantity: stock, lowStock },
            create: { variantId: existing.id, quantity: stock, lowStock },
          });
        } else {
          const created = await tx.productVariant.create({ data: { ...variantData, productId: id } });
          await tx.inventory.create({ data: { variantId: created.id, quantity: stock, lowStock } });
        }
      }
    }

    return tx.product.findUnique({ where: { id }, include: productInclude });
  });

  return ok(res, result);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exists = await prisma.product.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, 'Product not found');
  await prisma.product.delete({ where: { id } });
  return ok(res, { message: 'Product deleted' });
});
