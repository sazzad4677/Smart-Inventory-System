import { Request, Response, NextFunction } from 'express';
import ApiMetric from '../models/ApiMetric.model';
import { logger } from '../utils/logger';

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    const metricData: any = {
      method,
      endpoint: originalUrl,
      statusCode,
      responseTime: duration,
    };

    const ip = req.ip || req.socket.remoteAddress;
    if (ip) metricData.ip = ip;

    const userAgent = req.get('user-agent');
    if (userAgent) metricData.userAgent = userAgent;

    // We don't want to block the thread, so we save asynchronously without awaiting
    ApiMetric.create(metricData).catch((err) => {
      logger.error(`Failed to save API metric: ${err.message}`);
    });

    // We can also log slow requests (e.g. > 1000ms)
    if (duration > 1000) {
      logger.warn(`SLOW API REQUEST: ${method} ${originalUrl} took ${duration}ms`);
    }
  });

  next();
};
