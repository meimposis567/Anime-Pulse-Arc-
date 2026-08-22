# Security Policy

## Reporting a vulnerability

If you find a security issue in Anime Pulse ARC, please **do not open a public
issue**. Report it privately through
[GitHub Security Advisories](https://github.com/meimposis567/Anime-Pulse-Arc-/security/advisories/new)
so it can be fixed before it is disclosed.

Please include what you found, how to reproduce it, and what an attacker could
do with it. You can expect an initial response within a few days.

## Supported versions

Only the latest commit on `main` is supported.

## What this project does to protect you

### Secrets

- **No secret has a fallback value.** `backend/src/config.js` validates the
  environment at boot and **exits the process** if `JWT_SECRET` is missing,
  shorter than 32 characters, or set to a known placeholder such as
  `dev_secret` or `change_me_secret`. A hardcoded fallback in published source
  is a published signing key — anyone could mint a token for any account.
- `.env` files, private keys, certificates and credential files are excluded by
  [`.gitignore`](.gitignore). Only `.env.example` templates are committed.
- `MONGODB_URI` is likewise required, so the server can never quietly connect
  to an unintended database.

### Authentication

- Passwords are hashed with **bcrypt** at a configurable cost (default 12) and
  are never stored, logged, or returned.
- `passwordHash` is `select: false` on the schema and stripped in `toJSON`, so
  it cannot leak through an accidental `res.json(user)`.
- Tokens are **HS256 only**, pinned at verification time. A token presented as
  `alg: none`, or signed with any other algorithm, is rejected.
- Login answers identically for an unknown email and a wrong password, and
  performs a dummy bcrypt comparison when the account does not exist, so
  response timing does not reveal which addresses are registered.
- Registration enforces a minimum of 8 characters, at least three character
  classes, and rejects a list of common passwords.

### Rate limiting

| Scope | Budget |
| --- | --- |
| General API | 300 requests / 15 min |
| `POST /api/auth/login` | 10 **failed** attempts / 15 min |
| `POST /api/auth/register` | 5 accounts / hour |
| Authenticated writes | 100 requests / 15 min |

Authentication routes are **never** exempt from rate limiting. `trust proxy`
is pinned to a single hop so `X-Forwarded-For` cannot be spoofed to reset a
bucket.

### Input handling

- Every value that reaches a database query is proven to be a primitive string
  first. Without that check a body like `{"email": {"$gt": ""}}` becomes a
  MongoDB operator — NoSQL injection. Mongoose `sanitizeFilter` is enabled as a
  second layer.
- Numeric path parameters must be positive integers.
- JSON bodies are capped at 1 MB; search queries at 100 characters.

### Error handling

- Only errors the application raised itself (`HttpError`) have their message
  returned to the client. Everything else becomes a generic
  `"Something went wrong."` — raw exception text can disclose file paths,
  driver internals, query shapes and connection strings.
- Full detail is written to the server log instead.
- Async route handlers are wrapped so a rejected promise reaches the error
  handler rather than hanging the request.

### Transport and headers

- **Helmet** sets secure HTTP headers; `x-powered-by` is disabled.
- **CORS** uses an explicit origin allow-list. Add your deployed domain via
  `FRONTEND_URL`; wildcard origins are never used in production.

## Deployment checklist

- [ ] `JWT_SECRET` generated with `openssl rand -hex 32`, unique per environment
- [ ] `MONGODB_URI` uses a dedicated least-privilege database user
- [ ] MongoDB network access restricted to your server's IP — **not** `0.0.0.0/0`
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` set to your real origin
- [ ] TLS terminated in front of the API
- [ ] Any credential that has ever been shared, zipped, or pasted is rotated
