import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ok } from '../utils/response.js';

export const listZones = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true';
  const where = includeInactive ? {} : { isActive: true };
  const zones = await prisma.deliveryZone.findMany({ where, orderBy: [{ wilaya: 'asc' }, { commune: 'asc' }] });
  return ok(res, zones);
});

export const upsertZone = asyncHandler(async (req, res) => {
  const data = req.body;
  if (data.commune === '') data.commune = null;
  const existing = await prisma.deliveryZone.findFirst({
    where: { wilaya: data.wilaya, commune: data.commune ?? null },
  });
  let zone;
  if (existing) {
    zone = await prisma.deliveryZone.update({
      where: { id: existing.id },
      data,
    });
  } else {
    zone = await prisma.deliveryZone.create({
      data,
    });
  }
  return ok(res, zone, undefined, existing ? 200 : 201);
});

export const deleteZone = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exists = await prisma.deliveryZone.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, 'Delivery zone not found');
  await prisma.deliveryZone.delete({ where: { id } });
  return ok(res, { message: 'Delivery zone deleted' });
});
