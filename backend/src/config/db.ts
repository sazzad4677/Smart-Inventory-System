import mongoose from 'mongoose';
import { config } from './config';
import { logger } from '../utils/logger';
import { applyMongoosePerformancePlugin } from './mongoosePerformancePlugin';

const connectDB = async (): Promise<void> => {
  try {
    applyMongoosePerformancePlugin();
    const conn = await mongoose.connect(config.db.uri, {
      dbName: 'smart_inventory',
    });

    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('🔄 MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('🛑 MongoDB connection closed due to app termination');
  process.exit(0);
});

export default connectDB;
