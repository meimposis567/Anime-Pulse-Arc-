import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

router.post('/register', async (req,res)=>{
  try{
    const { username, email, password } = req.body;
    if(!username || !email || !password) return res.status(400).json({error:'Missing fields'});
    const existing = await User.findOne({ $or: [{email},{username}] });
    if(existing) return res.status(409).json({error:'User already exists'});
    const user = new User({ username, email, passwordHash: '' });
    await user.setPassword(password);
    await user.save();
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  }catch(e){
    res.status(500).json({error:e.message});
  }
});

router.post('/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(401).json({error:'Invalid credentials'});
    const ok = await user.validatePassword(password);
    if(!ok) return res.status(401).json({error:'Invalid credentials'});
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  }catch(e){
    res.status(500).json({error:e.message});
  }
});

export default router;