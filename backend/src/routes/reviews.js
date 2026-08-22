import { Router } from 'express';
import Review from '../models/Review.js';
import { authRequired } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { asyncHandler, badRequest } from '../utils/asyncHandler.js';
import { requireString, requirePositiveInt } from '../utils/validate.js';

const router = Router();

/** Reviews are public to read. */
router.get(
  '/:animeId',
  asyncHandler(async (req, res) => {
    const animeId = requirePositiveInt(req.params.animeId, 'animeId');
    const reviews = await Review.find({ animeId })
      // Only the username is populated — never the author's email or hash.
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    res.json(reviews);
  })
);

router.post(
  '/:animeId',
  authRequired,
  writeLimiter,
  asyncHandler(async (req, res) => {
    const animeId = requirePositiveInt(req.params.animeId, 'animeId');

    const rating = Number(req.body?.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw badRequest('rating must be a whole number between 1 and 5');
    }
    const content = req.body?.content == null
      ? ''
      : requireString(req.body.content, 'content', { min: 0, max: 2000 });

    // Keyed on (user, animeId) from the verified token, so a review can only
    // ever be created or replaced for the caller's own account.
    const doc = await Review.findOneAndUpdate(
      { user: req.user.id, animeId },
      { $set: { rating, content } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
    res.status(201).json(doc);
  })
);

router.delete(
  '/:animeId',
  authRequired,
  writeLimiter,
  asyncHandler(async (req, res) => {
    const animeId = requirePositiveInt(req.params.animeId, 'animeId');
    const { deletedCount } = await Review.deleteOne({ user: req.user.id, animeId });
    res.json({ ok: true, removed: deletedCount });
  })
);

export default router;
