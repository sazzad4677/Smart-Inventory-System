import { createClient, RedisClientType } from 'redis';
import { config } from './config';

export const redisClient: RedisClientType = createClient({
  url: config.redis.uri,
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));
redisClient.on('connect', () => console.log('🚀 Redis Connected Successfully'));

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error('⚠️ Redis Connection Failed. Rate limiting will fall back to memory.', error);
  }
};
