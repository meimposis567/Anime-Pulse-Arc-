import rateLimit from "express-rate-limit";

/**
 * Rate limiters.
 *
 * Authentication endpoints are the most attacked surface on the API, so they
 * get their own, far stricter buckets. They must never be exempted from
 * limiting: an unthrottled /login is an open invitation to credential
 * stuffing and password brute-forcing.
 */

const json = (message) => (req, res) =>
  res.status(429).json({ error: message });

/** General browsing traffic: search, featured, recommendations, details. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json("Too many requests. Please slow down and try again shortly."),
});

/**
 * Failed logins only — a successful sign-in does not consume the budget, so
 * a legitimate user is never locked out by their own normal activity.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json("Too many failed sign-in attempts. Try again in 15 minutes."),
});

/** Account creation: slow enough to make bulk signup automation pointless. */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json("Too many accounts created from this address. Try again later."),
});

/** Authenticated writes: favourites and reviews. */
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json("Too many changes at once. Please try again shortly."),
});
