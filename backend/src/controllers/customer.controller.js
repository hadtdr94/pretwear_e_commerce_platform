import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { getPagination, pagedMeta } from '../utils/pagination.js';

export const listCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const { q } = req.query;
  const where = { role: 'CUSTOMER' };
  if (q) {
    where.OR = [
      { email: { contains: String(q), mode: 'insensitive' } },
      { firstName: { contains: String(q), mode: 'insensitive' } },
      { lastName: { contains: String(q), mode: 'insensitive' } },
      { phone: { contains: String(q), mode: 'insensitive' } },
    ];
  }
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, createdAt: true, _count: { select: { orders: true, customizationRequests: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
  ]);
  return ok(res, users, pagedMeta(total, page, limit));
});
