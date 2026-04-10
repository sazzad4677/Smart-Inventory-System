import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient, connectRedis } from '../config/redis';

/**
 * This prevents ClientClosedError during module-level initialization.
 */
const robustSendCommand = async (...args: string[]) => {
  try {
    if (!redisClient.isOpen) {
      await connectRedis();
    }
    if (!redisClient.isOpen) return null;
    return await redisClient.sendCommand(args);
  } catch (error: any) {
    console.error('❌ Redis Command Failed:', error.message);
    return null; // Return null to fallback to memory
  }
};

// General API rate limiter (100 requests per 15 minutes)
export const apiRateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  ...(process.env.NODE_ENV !== 'test' && {
    store: new RedisStore({
      // @ts-expect-error
      sendCommand: (...args: string[]) => robustSendCommand(...args),
      prefix: 'rl:api:',
    }),
  }),
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  skip: (req) => req.path.includes('/auth/login') || req.path.includes('/auth/signup'),
  validate: { default: true },
});

// Auth-specific rate limiter (5 requests per 2 minutes)
export const authRateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  ...(process.env.NODE_ENV !== 'test' && {
    store: new RedisStore({
      // @ts-expect-error
      sendCommand: (...args: string[]) => robustSendCommand(...args),
      prefix: 'rl:auth:',
    }),
  }),
  message: {
    success: false,
    message: 'Too many auth attempts, please try again after 2 minutes',
  },
  validate: { default: true },
});
