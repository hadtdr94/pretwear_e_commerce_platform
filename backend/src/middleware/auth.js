import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/auth.js';

export async function authenticate(req, _res, next) {
  try {
    const token = req.cookies?.access_token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
    if (!token) throw new ApiError(401, 'Authentication required');
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, role: true, firstName: true, lastName: true, phone: true, isActive: true } });
    if (!user || !user.isActive) throw new ApiError(401, 'Invalid or inactive account');
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') return next(new ApiError(401, 'Invalid or expired token'));
    next(err);
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    const token = req.cookies?.access_token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
    if (!token) return next();
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, role: true, firstName: true, lastName: true, phone: true, isActive: true } });
    if (user && user.isActive) req.user = user;
  } catch {
    // ignore optional auth errors
  }
  next();
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (!roles.includes(req.user.role)) return next(new ApiError(403, 'Forbidden'));
    next();
  };
}
