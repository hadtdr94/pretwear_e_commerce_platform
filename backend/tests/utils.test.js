import { describe, it, expect, vi } from 'vitest';
import { getPagination, pagedMeta } from '../src/utils/pagination.js';
import { ok, fail } from '../src/utils/response.js';
import asyncHandler from '../src/utils/asyncHandler.js';
import ApiError from '../src/utils/ApiError.js';

function mockRes() {
  const res = { statusCode: 200, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (payload) => { res.body = payload; return res; };
  return res;
}

describe('pagination utils', () => {
  it('computes defaults and caps limit', () => {
    expect(getPagination({})).toEqual({ page: 1, limit: 12, skip: 0, take: 12 });
    expect(getPagination({ page: '2', limit: '5' })).toEqual({ page: 2, limit: 5, skip: 5, take: 5 });
    expect(getPagination({ page: '-1', limit: '999' })).toEqual({ page: 1, limit: 100, skip: 0, take: 100 });
  });

  it('builds paged meta', () => {
    expect(pagedMeta(25, 2, 12)).toEqual({ total: 25, page: 2, limit: 12, totalPages: 3 });
    expect(pagedMeta(0, 1, 12)).toEqual({ total: 0, page: 1, limit: 12, totalPages: 1 });
  });
});

describe('response utils', () => {
  it('returns success payload with optional meta', () => {
    const res = mockRes();
    ok(res, { a: 1 }, { page: 1 }, 201);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ success: true, data: { a: 1 }, meta: { page: 1 } });
  });

  it('returns error payload', () => {
    const res = mockRes();
    fail(res, 400, 'Bad', { x: 1 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ success: false, error: 'Bad', details: { x: 1 } });
  });
});

describe('asyncHandler', () => {
  it('forwards rejected errors to next', async () => {
    const err = new ApiError(418, 'teapot');
    const fn = asyncHandler(async () => { throw err; });
    const next = vi.fn();
    await fn({}, {}, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});
