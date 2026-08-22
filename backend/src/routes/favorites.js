import { Router } from 'express';
import Favorite from '../models/Favorite.js';
import { authRequired } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireString, requirePositiveInt } from '../utils/validate.js';

const router = Router();

// Every route below is scoped to `req.user.id`, which comes from the verified
// JWT and never from client input — a user can only ever read or delete their
// own favourites.
router.use(authRequired);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const list = await Favorite.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(list);
  })
);

router.post(
  '/',
  writeLimiter,
  asyncHandler(async (req, res) => {
    const animeId = requirePositiveInt(req.body?.animeId, 'animeId');
    const title = req.body?.title == null
      ? undefined
      : requireString(req.body.title, 'title', { max: 300 });
    const coverImage = req.body?.coverImage == null
      ? undefined
      : requireString(req.body.coverImage, 'coverImage', { max: 2048 });

    try {
      const fav = await Favorite.create({ user: req.user.id, animeId, title, coverImage });
      return res.status(201).json(fav);
    } catch (e) {
      // Already favourited — the unique index makes this idempotent.
      if (e?.code === 11000) {
        const existing = await Favorite.findOne({ user: req.user.id, animeId });
        return res.status(200).json(existing);
      }
      throw e;
    }
  })
);

router.delete(
  '/:animeId',
  writeLimiter,
  asyncHandler(async (req, res) => {
    const animeId = requirePositiveInt(req.params.animeId, 'animeId');
    const { deletedCount } = await Favorite.deleteOne({ user: req.user.id, animeId });
    res.json({ ok: true, removed: deletedCount });
  })
);

export default router;
