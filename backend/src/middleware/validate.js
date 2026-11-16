import ApiError from '../utils/ApiError.js';

export const validate = (schema, source = 'body') => (req, _res, next) => {
  try {
    const parsed = schema.parse(req[source]);
    req[source] = parsed;
    next();
  } catch (err) {
    const details = err?.issues?.map((i) => ({ path: i.path.join('.'), message: i.message })) || null;
    next(new ApiError(400, 'Validation error', details));
  }
};
