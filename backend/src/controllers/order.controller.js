import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { getPagination, pagedMeta } from '../utils/pagination.js';
import crypto from 'crypto';

function makeReference() {
  const y = new Date().getFullYear();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PW-${y}-${rand}`;
}

async function uniqueReference(tx) {
  for (let i = 0; i < 5; i++) {
    const ref = makeReference();
    const exists = await tx.order.findUnique({ where: { reference: ref } });
    if (!exists) return ref;
  }
  return `PW-${Date.now()}`;
}

export const createOrder = asyncHandler(async (req, res) => {
  const { items, paymentMethod, sessionId, ...customer } = req.body;
  const userId = req.user?.id || null;

  const order = await prisma.$transaction(async (tx) => {
    // consolidate items by variant
    const qtyMap = new Map();
    for (const it of items) qtyMap.set(it.variantId, (qtyMap.get(it.variantId) || 0) + it.quantity);
    const variantIds = [...qtyMap.keys()];

    const variants = await tx.productVariant.findMany({
      where: { id: { in: variantIds }, isActive: true },
      include: { product: true, inventory: true, size: true, color: true },
    });
    if (variants.length !== variantIds.length) throw new ApiError(400, 'One or more selected variants are invalid');

    let subtotal = 0;
    const orderItemsData = [];

    for (const v of variants) {
      const quantity = qtyMap.get(v.id);
      if (!v.product.isActive) throw new ApiError(400, `Product unavailable: ${v.product.name}`);
      const stock = v.inventory?.quantity ?? 0;
      if (stock < quantity) throw new ApiError(400, `Insufficient stock for ${v.product.name} (${v.sku})`);
      const unitPrice = v.salePrice ?? v.price ?? v.product.salePrice ?? v.product.basePrice;
      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;
      const variantName = [v.color?.name, v.size?.name].filter(Boolean).join(' / ') || null;
      orderItemsData.push({
        productId: v.productId,
        variantId: v.id,
        productName: v.product.name,
        variantName,
        sku: v.sku,
        unitPrice,
        quantity,
        lineTotal,
      });
    }

    // delivery fee from DeliveryZone (wilaya-specific, fallback commune)
    const cleanWilaya = customer.wilaya.trim();
    const zone = await tx.deliveryZone.findFirst({
      where: {
        isActive: true,
        OR: [
          { wilaya: cleanWilaya },
          { wilaya: { contains: cleanWilaya, mode: 'insensitive' } },
        ],
      },
      orderBy: { commune: 'desc' },
    });
    const deliveryFee = zone?.fee ?? 0;
    const total = subtotal + deliveryFee;

    // decrement stock
    for (const v of variants) {
      const quantity = qtyMap.get(v.id);
      const inv = v.inventory;
      if (!inv) throw new ApiError(400, `Inventory missing for variant ${v.sku}`);
      const updated = await tx.inventory.updateMany({
        where: { id: inv.id, quantity: { gte: quantity } },
        data: { quantity: { decrement: quantity } },
      });
      if (updated.count !== 1) throw new ApiError(400, `Stock changed for ${v.product.name}, please retry`);
    }

    const reference = await uniqueReference(tx);
    const created = await tx.order.create({
      data: {
        reference,
        userId,
        status: 'PENDING',
        ...customer,
        subtotal,
        deliveryFee,
        discount: 0,
        total,
        items: { create: orderItemsData },
        payment: { create: { method: paymentMethod || 'COD', status: 'PENDING', amount: total } },
      },
      include: { items: true, payment: true },
    });

    // clear cart if session/user cart exists and matches
    if (userId) {
      const cart = await tx.cart.findFirst({ where: { userId } });
      if (cart) await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    } else if (sessionId) {
      const cart = await tx.cart.findUnique({ where: { sessionId } });
      if (cart) await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return created;
  });

  return ok(res, order, undefined, 201);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const where = { userId: req.user.id };
  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({ where, include: { items: true, payment: true }, orderBy: { createdAt: 'desc' }, skip, take }),
  ]);
  return ok(res, orders, pagedMeta(total, page, limit));
});

export const getOrderByReference = asyncHandler(async (req, res) => {
  const { reference } = req.params;
  const order = await prisma.order.findUnique({ where: { reference }, include: { items: true, payment: true } });
  if (!order) throw new ApiError(404, 'Order not found');
  // allow owner or admin/manager
  const isPrivileged = req.user && ['ADMIN', 'MANAGER'].includes(req.user.role);
  const isOwner = req.user && order.userId === req.user.id;
  if (!isPrivileged && !isOwner) throw new ApiError(403, 'Forbidden');
  return ok(res, order);
});

export const listOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const { status, q } = req.query;
  const where = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { reference: { contains: String(q), mode: 'insensitive' } },
      { customerName: { contains: String(q), mode: 'insensitive' } },
      { customerPhone: { contains: String(q), mode: 'insensitive' } },
    ];
  }
  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({ where, include: { items: true, payment: true }, orderBy: { createdAt: 'desc' }, skip, take }),
  ]);
  return ok(res, orders, pagedMeta(total, page, limit));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const existing = await prisma.order.findUnique({ where: { id }, include: { payment: true } });
  if (!existing) throw new ApiError(404, 'Order not found');
  const order = await prisma.order.update({
    where: { id },
    data: {
      status,
      payment: status === 'DELIVERED' && existing.payment?.method === 'COD' ? { update: { status: 'PAID' } } : undefined,
    },
    include: { items: true, payment: true },
  });
  return ok(res, order);
});
