import { createClient, RedisClientType } from 'redis';
import { config } from './config';

export const redisClient: RedisClientType = createClient({
  url: config.redis.uri,
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));
redisClient.on('connect', () => console.log('🚀 Redis Connected Successfully'));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};
