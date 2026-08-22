/**
 * Centralised, fail-fast configuration.
 *
 * Every secret is validated here at import time. If something required is
 * missing or obviously unsafe the process exits immediately with a clear
 * message, instead of silently falling back to a hardcoded default that an
 * attacker could look up in this repository.
 */

const isProd = process.env.NODE_ENV === "production";

/** Placeholder values that must never reach a running server. */
const FORBIDDEN_SECRETS = new Set([
  "dev_secret",
  "change_me",
  "change_me_secret",
  "changeme",
  "replace_with_a_long_random_secret",
  "secret",
  "jwtsecret",
  "jwt_secret",
  "test",
  "password",
]);

const MIN_SECRET_LENGTH = 32;

function fail(varName, reason) {
  console.error(
    [
      "",
      "════════════════════════════════════════════════════════════════",
      ` FATAL: environment variable ${varName} ${reason}`,
      "════════════════════════════════════════════════════════════════",
      "",
      " Anime Pulse ARC refuses to start without a valid configuration.",
      " Copy backend/.env.example to backend/.env and fill it in.",
      "",
      " Generate a strong JWT_SECRET with:",
      "   openssl rand -hex 32",
      "",
      " PowerShell alternative:",
      "   -join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) })",
      "",
    ].join("\n")
  );
  process.exit(1);
}

/* ------------------------------- JWT_SECRET ------------------------------ */

const JWT_SECRET = (process.env.JWT_SECRET || "").trim();

if (!JWT_SECRET) {
  fail("JWT_SECRET", "is not set");
}
if (FORBIDDEN_SECRETS.has(JWT_SECRET.toLowerCase())) {
  fail(
    "JWT_SECRET",
    "is still set to a well-known placeholder value. Anyone reading this " +
      "repository could forge authentication tokens with it"
  );
}
if (JWT_SECRET.length < MIN_SECRET_LENGTH) {
  fail(
    "JWT_SECRET",
    `is only ${JWT_SECRET.length} characters long; at least ${MIN_SECRET_LENGTH} are required`
  );
}

/* ------------------------------ MONGODB_URI ------------------------------ */

const MONGODB_URI = (process.env.MONGODB_URI || "").trim();

if (!MONGODB_URI) {
  fail("MONGODB_URI", "is not set");
}

/* --------------------------------- Export -------------------------------- */

export const config = {
  isProd,
  port: Number(process.env.PORT) || 5001,
  anilistUrl: process.env.ANILIST_URL || "https://graphql.anilist.co",
  mongodbUri: MONGODB_URI,
  mongodbDb: process.env.MONGODB_DB || "anime_pulse_arc",
  jwtSecret: JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jwtAlgorithm: "HS256",
  frontendUrl: process.env.FRONTEND_URL || null,
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
};

export default config;
