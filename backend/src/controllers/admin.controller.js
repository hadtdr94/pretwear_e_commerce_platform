import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';

export const dashboard = asyncHandler(async (_req, res) => {
  const [
    products,
    totalOrders,
    deliveredOrders,
    pendingOrders,
    processingOrders,
    cancelledOrders,
    customers,
    pendingCustomizations,
    deliveredRevenueAgg,
    pendingRevenueAgg,
    totalRevenueAgg,
    recentOrders,
    lowStock,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED'] } } }),
    prisma.order.count({ where: { status: 'CANCELLED' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.customizationRequest.count({ where: { status: { in: ['PENDING', 'REVIEWING'] } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: 'DELIVERED' } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
    prisma.order.findMany({ take: 8, orderBy: { createdAt: 'desc' }, include: { items: true, payment: true } }),
    prisma.inventory.findMany({ where: { quantity: { lte: 5 } }, take: 10, include: { variant: { include: { product: true, size: true, color: true } } }, orderBy: { quantity: 'asc' } }),
  ]);

  return ok(res, {
    metrics: {
      products,
      orders: totalOrders,
      deliveredOrders,
      pendingOrders,
      processingOrders,
      cancelledOrders,
      customers,
      pendingCustomizations,
      deliveredRevenue: deliveredRevenueAgg._sum.total || 0,
      pendingRevenue: pendingRevenueAgg._sum.total || 0,
      totalRevenue: totalRevenueAgg._sum.total || 0,
      revenue: deliveredRevenueAgg._sum.total || 0, // backwards compatibility
    },
    recentOrders,
    lowStock,
  });
});
