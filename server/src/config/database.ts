import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../infrastructure/logger';

/**
 * Connects to MongoDB via Mongoose.
 * Called once at server startup — not on every request.
 */
export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);

    logger.info({ uri: maskConnectionUri(env.MONGODB_URI) }, 'MongoDB connected');
  } catch (error) {
    logger.fatal({ err: error }, 'MongoDB connection failed');
    process.exit(1);
  }
}

/**
 * Graceful disconnect — used during shutdown.
 */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

/** Hide credentials in logs */
function maskConnectionUri(uri: string): string {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
}
