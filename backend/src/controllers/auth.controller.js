import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { comparePassword, hashPassword, signAccessToken, signRefreshToken, setAuthCookies, clearAuthCookies, createResetToken, hashToken } from '../utils/auth.js';

function safeUser(user) {
  if (!user) return null;
  const { password, resetTokenHash, resetTokenExpiresAt, ...rest } = user;
  return rest;
}

export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'Email already registered');
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, password: hashed, firstName, lastName, phone, role: 'CUSTOMER' } });
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  setAuthCookies(res, access, refresh);
  return ok(res, { user: safeUser(user) }, undefined, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) throw new ApiError(401, 'Invalid credentials');
  const valid = await comparePassword(password, user.password);
  if (!valid) throw new ApiError(401, 'Invalid credentials');
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  setAuthCookies(res, access, refresh);
  return ok(res, { user: safeUser(user) });
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookies(res);
  return ok(res, { message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  return ok(res, { user: safeUser(req.user) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const { raw, hash, expiresAt } = createResetToken();
    await prisma.user.update({ where: { id: user.id }, data: { resetTokenHash: hash, resetTokenExpiresAt: expiresAt } });
    // Email delivery provider is configurable; for dev we return token only in non-production responses.
    if (process.env.NODE_ENV !== 'production') {
      return ok(res, { message: 'Reset token generated (dev only). Configure SMTP for email delivery.', resetToken: raw });
    }
  }
  return ok(res, { message: 'If the email exists, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const tokenHash = hashToken(token);
  const user = await prisma.user.findFirst({ where: { resetTokenHash: tokenHash, resetTokenExpiresAt: { gt: new Date() } } });
  if (!user) throw new ApiError(400, 'Invalid or expired reset token');
  const hashed = await hashPassword(password);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed, resetTokenHash: null, resetTokenExpiresAt: null } });
  return ok(res, { message: 'Password reset successful' });
});
