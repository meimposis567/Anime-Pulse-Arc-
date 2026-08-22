import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 32 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  // `select: false` keeps the hash out of every query result by default, so a
  // stray res.json(user) can never leak it.
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['user','admin'], default: 'user' },
}, { timestamps: true });

// Never serialise credentials, even if the field was explicitly selected.
UserSchema.set('toJSON', {
  transform(doc, ret){
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  }
});

UserSchema.methods.setPassword = async function(password){
  const salt = await bcrypt.genSalt(config.bcryptRounds);
  this.passwordHash = await bcrypt.hash(password, salt);
}

UserSchema.methods.validatePassword = async function(password){
  if(!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
}

export default mongoose.model('User', UserSchema);
