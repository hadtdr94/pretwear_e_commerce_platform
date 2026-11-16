import ApiError from '../utils/ApiError.js';

export default function errorHandler(err, _req, res, _next) {
  const status = err instanceof ApiError ? err.status : (err.status || 500);
  const message = err.message || 'Internal Server Error';
  const details = err.details || null;
  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, error: message, details });
}
