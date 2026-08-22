import { Router } from 'express';
import Review from '../models/Review.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/:animeId', async (req,res)=>{
  const reviews = await Review.find({ animeId: Number(req.params.animeId) }).populate('user','username').lean();
  res.json(reviews);
});

router.post('/:animeId', authRequired, async (req,res)=>{
  const { rating, content } = req.body;
  const animeId = Number(req.params.animeId);
  try{
    const doc = await Review.findOneAndUpdate(
      { user: req.user.id, animeId },
      { $set: { rating, content } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(doc);
  }catch(e){
    res.status(500).json({error:e.message});
  }
});

router.delete('/:animeId', authRequired, async (req,res)=>{
  await Review.deleteOne({ user: req.user.id, animeId: Number(req.params.animeId) });
  res.json({ ok:true });
});

export default router;