import mongoose from 'mongoose';
import { config } from './config.js';

/**
 * Connects to MongoDB.
 *
 * The URI is validated in config.js at boot — there is no hardcoded fallback,
 * so the server can never quietly connect to an unexpected database.
 */
export async function connectDB(uri = config.mongodbUri){
  mongoose.set('strictQuery', true);
  // Reject unknown keys instead of silently dropping them; this is what stops
  // a smuggled query operator from reaching the database.
  mongoose.set('sanitizeFilter', true);

  await mongoose.connect(uri, {
    dbName: config.mongodbDb,
    serverSelectionTimeoutMS: 10000,
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err.message);
  });
}
