import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    // Save asynchronously to Prisma
    prisma.apiMetric
      .create({
        data: {
          method,
          path: originalUrl,
          statusCode,
          duration,
        },
      })
      .catch((err) => {
        logger.error(`Failed to save API metric: ${err.message}`);
      });

    // Log slow requests (e.g. > 1000ms)
    if (duration > 1000) {
      logger.warn(`SLOW API REQUEST: ${method} ${originalUrl} took ${duration}ms`);
    }
  });

  next();
};
