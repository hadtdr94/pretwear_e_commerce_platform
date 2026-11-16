import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ok } from '../utils/response.js';

export const listCategories = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true';
  const where = includeInactive ? {} : { isActive: true };
  const categories = await prisma.category.findMany({
    where,
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  return ok(res, categories);
});

export const getCategory = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const category = await prisma.category.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw new ApiError(404, 'Category not found');
  return ok(res, category);
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.create({ data: req.body });
  return ok(res, category, undefined, 201);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exists = await prisma.category.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, 'Category not found');
  const category = await prisma.category.update({ where: { id }, data: req.body });
  return ok(res, category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exists = await prisma.category.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, 'Category not found');
  await prisma.category.delete({ where: { id } });
  return ok(res, { message: 'Category deleted' });
});
