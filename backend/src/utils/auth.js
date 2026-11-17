import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev-access-secret');
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret');
}

export function setAuthCookies(res, accessToken, refreshToken) {
  const secure = String(process.env.COOKIE_SECURE).toLowerCase() === 'true';
  const sameSite = process.env.COOKIE_SAME_SITE || 'lax';
  const base = { httpOnly: true, secure, sameSite, path: '/' };
  res.cookie('access_token', accessToken, { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

export function clearAuthCookies(res) {
  const secure = String(process.env.COOKIE_SECURE).toLowerCase() === 'true';
  const sameSite = process.env.COOKIE_SAME_SITE || 'lax';
  const base = { httpOnly: true, secure, sameSite, path: '/' };
  res.clearCookie('access_token', base);
  res.clearCookie('refresh_token', base);
}

export function createResetToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return { raw, hash, expiresAt };
}

export function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}
