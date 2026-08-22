import { badRequest } from "./asyncHandler.js";

/**
 * Input validation helpers.
 *
 * The type guards here exist for more than tidiness: Express parses JSON
 * bodies into arbitrary structures, so a client can send
 * `{"email": {"$gt": ""}}`. Passing that straight into a Mongoose query turns
 * it into a MongoDB operator (NoSQL injection). Every value that reaches a
 * query must therefore be proven to be a primitive string first.
 */

/** Rejects anything that is not a plain, non-empty string. */
export function requireString(value, field, { min = 1, max = 512 } = {}) {
  if (typeof value !== "string") {
    throw badRequest(`${field} must be a string`);
  }
  const trimmed = value.trim();
  if (trimmed.length < min) {
    throw badRequest(
      min === 1
        ? `${field} is required`
        : `${field} must be at least ${min} characters`
    );
  }
  if (trimmed.length > max) {
    throw badRequest(`${field} must be at most ${max} characters`);
  }
  return trimmed;
}

/** Parses a positive integer path/query parameter. */
export function requirePositiveInt(value, field) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw badRequest(`${field} must be a positive integer`);
  }
  return n;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function requireEmail(value, field = "email") {
  const email = requireString(value, field, { max: 254 }).toLowerCase();
  if (!EMAIL_RE.test(email)) {
    throw badRequest("Please provide a valid email address");
  }
  return email;
}

const USERNAME_RE = /^[a-zA-Z0-9._-]+$/;

export function requireUsername(value, field = "username") {
  const username = requireString(value, field, { min: 3, max: 32 });
  if (!USERNAME_RE.test(username)) {
    throw badRequest(
      "Username may only contain letters, numbers, dots, underscores and hyphens"
    );
  }
  return username;
}

/** Passwords that are long enough to pass the length check but still trivial. */
const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "12345678",
  "123456789",
  "1234567890",
  "qwertyuiop",
  "iloveyou",
  "letmein1",
  "admin123",
  "welcome1",
  "abc12345",
]);

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/**
 * Enforces a password policy on registration.
 *
 * Not trimmed: leading and trailing spaces are legitimate password characters
 * and silently stripping them would lock users out of their own accounts.
 */
export function requireStrongPassword(value, field = "password") {
  if (typeof value !== "string") {
    throw badRequest(`${field} must be a string`);
  }
  if (value.length < PASSWORD_MIN_LENGTH) {
    throw badRequest(
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
    );
  }
  // bcrypt silently truncates beyond 72 bytes; cap well before that surprises anyone.
  if (value.length > PASSWORD_MAX_LENGTH) {
    throw badRequest(
      `Password must be at most ${PASSWORD_MAX_LENGTH} characters long`
    );
  }
  if (COMMON_PASSWORDS.has(value.toLowerCase())) {
    throw badRequest("That password is too common. Please choose another one");
  }
  const classes = [
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /[0-9]/.test(value),
    /[^a-zA-Z0-9]/.test(value),
  ].filter(Boolean).length;
  if (classes < 3) {
    throw badRequest(
      "Password must include at least three of: lowercase letter, " +
        "uppercase letter, number, symbol"
    );
  }
  return value;
}

/** Accepts a login password without applying the registration policy. */
export function requireLoginPassword(value, field = "password") {
  if (typeof value !== "string" || value.length === 0) {
    throw badRequest(`${field} is required`);
  }
  if (value.length > PASSWORD_MAX_LENGTH) {
    throw badRequest("Invalid credentials");
  }
  return value;
}
