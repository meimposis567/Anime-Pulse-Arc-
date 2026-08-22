/**
 * Wraps an async route handler so a rejected promise is forwarded to the
 * centralised Express error handler instead of leaving the request hanging.
 */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/**
 * An error carrying an HTTP status code and a message that is safe to show
 * to the client. Anything thrown that is *not* an HttpError is treated as an
 * internal fault and reported generically in production.
 */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.expose = true;
  }
}

export const badRequest = (msg) => new HttpError(400, msg);
export const unauthorized = (msg = "Unauthorized") => new HttpError(401, msg);
export const conflict = (msg) => new HttpError(409, msg);

export default asyncHandler;
