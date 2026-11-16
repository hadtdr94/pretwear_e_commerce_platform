import prisma from '../config/prisma.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ok } from '../utils/response.js';
import { getPagination, pagedMeta } from '../utils/pagination.js';

const include = { attachments: true, quotes: { orderBy: { createdAt: 'desc' } } };

export const createRequest = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.email === '') data.email = null;
  const files = req.files || [];
  const userId = req.user?.id || null;

  const request = await prisma.customizationRequest.create({
    data: {
      ...data,
      userId,
      attachments: files.length ? {
        create: files.map((f) => ({
          filename: f.filename,
          originalName: f.originalname,
          mimeType: f.mimetype,
          size: f.size,
          url: `/uploads/${f.filename}`,
        })),
      } : undefined,
    },
    include,
  });
  return ok(res, request, undefined, 201);
});

export const listRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const { status, q } = req.query;
  const where = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { customerName: { contains: String(q), mode: 'insensitive' } },
      { phone: { contains: String(q), mode: 'insensitive' } },
      { productType: { contains: String(q), mode: 'insensitive' } },
    ];
  }
  const [total, requests] = await Promise.all([
    prisma.customizationRequest.count({ where }),
    prisma.customizationRequest.findMany({ where, include, orderBy: { createdAt: 'desc' }, skip, take }),
  ]);
  return ok(res, requests, pagedMeta(total, page, limit));
});

export const getRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const request = await prisma.customizationRequest.findUnique({ where: { id }, include });
  if (!request) throw new ApiError(404, 'Customization request not found');
  const isPrivileged = req.user && ['ADMIN', 'MANAGER'].includes(req.user.role);
  const isOwner = req.user && request.userId === req.user.id;
  if (!isPrivileged && !isOwner) throw new ApiError(403, 'Forbidden');
  return ok(res, request);
});

export const getMyRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const where = { userId: req.user.id };
  const [total, requests] = await Promise.all([
    prisma.customizationRequest.count({ where }),
    prisma.customizationRequest.findMany({ where, include, orderBy: { createdAt: 'desc' }, skip, take }),
  ]);
  return ok(res, requests, pagedMeta(total, page, limit));
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exists = await prisma.customizationRequest.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, 'Customization request not found');
  const request = await prisma.customizationRequest.update({ where: { id }, data: req.body, include });
  return ok(res, request);
});

export const addQuote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exists = await prisma.customizationRequest.findUnique({ where: { id } });
  if (!exists) throw new ApiError(404, 'Customization request not found');
  const data = { ...req.body, requestId: id, createdBy: req.user?.id || null };
  if (data.validUntil) data.validUntil = new Date(data.validUntil);
  const quote = await prisma.quote.create({ data });
  // optionally move status to QUOTED if still pending/reviewing
  if (['PENDING', 'REVIEWING'].includes(exists.status)) {
    await prisma.customizationRequest.update({ where: { id }, data: { status: 'QUOTED' } });
  }
  const request = await prisma.customizationRequest.findUnique({ where: { id }, include });
  return ok(res, { quote, request }, undefined, 201);
});
