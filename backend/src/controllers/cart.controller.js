import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ok } from '../utils/response.js';

const cartInclude = {
  items: {
    include: {
      product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } },
      variant: { include: { size: true, color: true, inventory: true } },
    },
    orderBy: { createdAt: 'asc' },
  },
};

async function resolveCart(req, { create = false } = {}) {
  const userId = req.user?.id || null;
  const sessionId = req.body?.sessionId || req.query?.sessionId || null;

  let cart = null;
  if (userId) {
    cart = await prisma.cart.findFirst({ where: { userId }, include: cartInclude });
  } else if (sessionId) {
    cart = await prisma.cart.findUnique({ where: { sessionId }, include: cartInclude });
  }

  if (!cart && create) {
    if (userId) {
      cart = await prisma.cart.create({ data: { userId }, include: cartInclude });
    } else if (sessionId) {
      cart = await prisma.cart.create({ data: { sessionId }, include: cartInclude });
    } else {
      throw new ApiError(400, 'sessionId is required for guest cart');
    }
  }

  if (cart && userId && cart.userId !== userId) throw new ApiError(403, 'Forbidden');
  return cart;
}

function cartSummary(cart) {
  if (!cart) return { id: null, items: [], subtotal: 0, count: 0 };
  const items = cart.items.map((i) => ({
    ...i,
    lineTotal: i.unitPrice * i.quantity,
  }));
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  return { ...cart, items, subtotal, count };
}

export const getCart = asyncHandler(async (req, res) => {
  const cart = await resolveCart(req, { create: false });
  return ok(res, cartSummary(cart));
});

export const addItem = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity } = req.body;
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { inventory: true, product: true },
  });
  if (!variant || !variant.isActive || variant.productId !== productId || !variant.product.isActive) {
    throw new ApiError(400, 'Invalid product variant');
  }
  const available = variant.inventory?.quantity ?? 0;
  if (available < quantity) throw new ApiError(400, 'Insufficient stock for selected variant');

  const cart = await resolveCart(req, { create: true });
  const existing = await prisma.cartItem.findUnique({ where: { cartId_variantId: { cartId: cart.id, variantId } } });
  const unitPrice = variant.salePrice ?? variant.price ?? variant.product.salePrice ?? variant.product.basePrice;

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (available < newQty) throw new ApiError(400, 'Insufficient stock for selected variant');
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty, unitPrice } });
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, productId, variantId, quantity, unitPrice } });
  }

  const updated = await prisma.cart.findUnique({ where: { id: cart.id }, include: cartInclude });
  return ok(res, cartSummary(updated), undefined, 201);
});

export const updateItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true, variant: { include: { inventory: true } } } });
  if (!item) throw new ApiError(404, 'Cart item not found');
  // basic ownership check
  if (req.user?.id && item.cart.userId && item.cart.userId !== req.user.id) throw new ApiError(403, 'Forbidden');
  const sessionId = req.body?.sessionId || req.query?.sessionId;
  if (!req.user?.id && item.cart.sessionId && sessionId && item.cart.sessionId !== sessionId) throw new ApiError(403, 'Forbidden');

  const available = item.variant.inventory?.quantity ?? 0;
  if (available < quantity) throw new ApiError(400, 'Insufficient stock for selected variant');
  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  const updated = await prisma.cart.findUnique({ where: { id: item.cartId }, include: cartInclude });
  return ok(res, cartSummary(updated));
});

export const removeItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
  if (!item) throw new ApiError(404, 'Cart item not found');
  if (req.user?.id && item.cart.userId && item.cart.userId !== req.user.id) throw new ApiError(403, 'Forbidden');
  const sessionId = req.body?.sessionId || req.query?.sessionId;
  if (!req.user?.id && item.cart.sessionId && sessionId && item.cart.sessionId !== sessionId) throw new ApiError(403, 'Forbidden');

  await prisma.cartItem.delete({ where: { id: itemId } });
  const updated = await prisma.cart.findUnique({ where: { id: item.cartId }, include: cartInclude });
  return ok(res, cartSummary(updated));
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await resolveCart(req, { create: false });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  const updated = cart ? await prisma.cart.findUnique({ where: { id: cart.id }, include: cartInclude }) : null;
  return ok(res, cartSummary(updated));
});
