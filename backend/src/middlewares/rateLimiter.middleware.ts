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
    // If still not open after attempting connection, fall back gracefully
    if (!redisClient.isOpen) {
      return null;
    }
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
  store: new RedisStore({
    // @ts-expect-error
    sendCommand: (...args: string[]) => robustSendCommand(...args),
  }),
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  skip: (req) => req.path.includes('/auth/login'),
  validate: { default: true },
});

// Login-specific rate limiter (5 requests per 15 minutes)
export const loginRateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-expect-error
    sendCommand: (...args: string[]) => robustSendCommand(...args),
  }),
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 2 minutes',
  },
  validate: { default: true },
});
