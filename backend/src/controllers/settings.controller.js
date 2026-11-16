import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';

export const getSettings = asyncHandler(async (_req, res) => {
  let settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });
  if (!settings) settings = await prisma.storeSettings.create({ data: { id: 'default' } });
  return ok(res, settings);
});

export const updateSettings = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.email === '') data.email = null;
  const settings = await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data },
  });
  return ok(res, settings);
});
