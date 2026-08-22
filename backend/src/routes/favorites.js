import { Router } from 'express';
import Favorite from '../models/Favorite.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, async (req,res)=>{
  const list = await Favorite.find({ user: req.user.id }).lean();
  res.json(list);
});

router.post('/', authRequired, async (req,res)=>{
  const { animeId, title, coverImage } = req.body;
  if(!animeId) return res.status(400).json({error:'animeId required'});
  try{
    const fav = await Favorite.create({ user: req.user.id, animeId, title, coverImage });
    res.status(201).json(fav);
  }catch(e){
    if(e.code===11000) return res.status(200).json(await Favorite.findOne({ user:req.user.id, animeId }));
    res.status(500).json({error:e.message});
  }
});

router.delete('/:animeId', authRequired, async (req,res)=>{
  await Favorite.deleteOne({ user: req.user.id, animeId: Number(req.params.animeId) });
  res.json({ ok:true });
});

export default router;