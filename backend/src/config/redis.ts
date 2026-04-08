import { createClient, RedisClientType } from 'redis';
import { config } from './config';
import { logger } from '../utils/logger';

export const redisClient: RedisClientType = createClient({
  url: config.redis.uri,
});

redisClient.on('error', (err) => logger.error('❌ Redis Client Error', err));
redisClient.on('connect', () => logger.info('🚀 Redis Connected Successfully'));

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    logger.error('⚠️ Redis Connection Failed. Rate limiting will fall back to memory.', error);
  }
};
