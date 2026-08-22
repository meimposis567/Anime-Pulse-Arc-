import mongoose from 'mongoose';

export async function connectDB(uri){
  const MONGODB_URI = uri || process.env.MONGODB_URI || 'mongodb://mongo:27017/anime_portal';
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || 'anime_portal' });
  console.log('MongoDB connected');
}