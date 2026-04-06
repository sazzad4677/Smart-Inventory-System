import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';

export const checkCache =
  (key: string) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        return res.status(200).json({
          success: true,
          message: 'Data fetched from cache',
          data: JSON.parse(cachedData),
        });
      }

      next();
    } catch (error) {
      console.error('❌ Redis Cache Middleware Error:', error);
      next();
    }
  };
