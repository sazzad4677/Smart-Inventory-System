import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient, connectRedis } from '../config/redis';

/**
 * Robust send command helper for Redis fallback.
 */
const robustSendCommand = async (...args: string[]) => {
  try {
    if (!redisClient.isOpen) {
      await connectRedis();
    }
    if (!redisClient.isOpen) return null;
    return await redisClient.sendCommand(args);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Redis Command Failed (AI Limiter):', errorMessage);
    return null;
  }
};

// AI-specific rate limiter (10 requests per minute to stay in safe zone)
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  ...(process.env.NODE_ENV !== 'test' && {
    store: new RedisStore({
      // @ts-expect-error
      sendCommand: (...args: string[]) => robustSendCommand(...args),
      prefix: 'rl:ai:',
    }),
  }),
  message: {
    success: false,
    message: 'AI rate limit exceeded. Please try again in a minute.',
  },
  validate: { default: true },
});
