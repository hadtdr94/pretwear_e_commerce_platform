import { Router } from 'express';
import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/sizes', asyncHandler(async (_req, res) => {
  const sizes = await prisma.size.findMany({ orderBy: { sortOrder: 'asc' } });
  return ok(res, sizes);
}));

router.get('/colors', asyncHandler(async (_req, res) => {
  const colors = await prisma.color.findMany({ orderBy: { name: 'asc' } });
  return ok(res, colors);
}));

// simple create helpers for admin
router.post('/sizes', authenticate, authorize('ADMIN', 'MANAGER'), asyncHandler(async (req, res) => {
  const { name, sortOrder = 0 } = req.body || {};
  const size = await prisma.size.create({ data: { name, sortOrder: Number(sortOrder) || 0 } });
  return ok(res, size, undefined, 201);
}));

router.post('/colors', authenticate, authorize('ADMIN', 'MANAGER'), asyncHandler(async (req, res) => {
  const { name, hex } = req.body || {};
  const color = await prisma.color.create({ data: { name, hex: hex || null } });
  return ok(res, color, undefined, 201);
}));

export default router;
