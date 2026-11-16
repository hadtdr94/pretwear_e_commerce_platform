export function ok(res, data, meta = undefined, status = 200) {
  const payload = { success: true, data };
  if (meta !== undefined) payload.meta = meta;
  return res.status(status).json(payload);
}

export function fail(res, status, message, details = null) {
  return res.status(status).json({ success: false, error: message, details });
}
