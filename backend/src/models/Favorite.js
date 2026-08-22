import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  animeId: { type: Number, required: true, index: true },
  title: { type: String },
  coverImage: { type: String },
}, { timestamps: true });

FavoriteSchema.index({ user:1, animeId:1 }, { unique: true });

export default mongoose.model('Favorite', FavoriteSchema);