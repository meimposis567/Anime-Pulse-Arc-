import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  animeId: { type: Number, required: true, index: true },
  rating: { type: Number, min: 1, max: 5 },
  content: { type: String, maxlength: 2000 },
}, { timestamps: true });

ReviewSchema.index({ animeId:1, user:1 }, { unique: true });

export default mongoose.model('Review', ReviewSchema);