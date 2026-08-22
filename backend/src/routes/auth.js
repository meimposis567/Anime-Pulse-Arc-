import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken, authRequired } from '../middleware/auth.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimit.js';
import { asyncHandler, conflict, unauthorized } from '../utils/asyncHandler.js';
import {
  requireEmail,
  requireUsername,
  requireStrongPassword,
  requireLoginPassword,
} from '../utils/validate.js';

const router = Router();

/**
 * A precomputed hash of a value nobody knows, compared against when the
 * requested account does not exist. Without it, a missing user returns far
 * faster than a wrong password, and that timing difference alone tells an
 * attacker which email addresses are registered.
 */
const DUMMY_HASH = bcrypt.hashSync('anime-pulse-arc::timing-equaliser', 12);

/** Fields that are safe to send back to the client. */
const publicUser = (user) => ({
  id: String(user._id),
  username: user.username,
  email: user.email,
  role: user.role,
});

/* -------------------------------- Register ------------------------------- */

router.post(
  '/register',
  registerLimiter,
  asyncHandler(async (req, res) => {
    // Validated to primitive strings before touching the database, so a body
    // like {"email": {"$gt": ""}} cannot become a MongoDB query operator.
    const username = requireUsername(req.body?.username);
    const email = requireEmail(req.body?.email);
    const password = requireStrongPassword(req.body?.password);

    const existing = await User.findOne({ $or: [{ email }, { username }] })
      .select('_id')
      .lean();
    if (existing) throw conflict('An account with that email or username already exists');

    const user = new User({ username, email, passwordHash: '' });
    await user.setPassword(password);

    try {
      await user.save();
    } catch (e) {
      // Two simultaneous signups can both pass the check above; the unique
      // index is the real guarantee.
      if (e?.code === 11000) {
        throw conflict('An account with that email or username already exists');
      }
      throw e;
    }

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  })
);

/* --------------------------------- Login --------------------------------- */

router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const email = requireEmail(req.body?.email);
    const password = requireLoginPassword(req.body?.password);

    // passwordHash is `select: false` on the schema, so ask for it explicitly.
    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      // Burn the same time a real comparison would take, then fail
      // identically to a wrong password — no account enumeration.
      await bcrypt.compare(password, DUMMY_HASH);
      throw unauthorized('Invalid credentials');
    }

    const ok = await user.validatePassword(password);
    if (!ok) throw unauthorized('Invalid credentials');

    res.json({ token: signToken(user), user: publicUser(user) });
  })
);

/* --------------------------------- Whoami -------------------------------- */

router.get(
  '/me',
  authRequired,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: publicUser(user) });
  })
);

export default router;
