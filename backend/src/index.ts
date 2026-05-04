import express, { Request, Response, NextFunction, Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';

import { config } from './config/config';
import prisma from './config/prisma';
import { connectRedis, redisClient } from './config/redis';
import { apiRateLimiter } from './middlewares/rateLimiter.middleware';
import { performanceMiddleware } from './middlewares/performance.middleware';
import { globalErrorHandler } from './middlewares/error.middleware';
import router from './routes';
import { AppError } from './utils/AppError';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './docs/swagger';
import { logger } from './utils/logger';
import { morganMiddleware } from './middlewares/morgan.middleware';

export const app: Application = express();
export const server: http.Server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.cors.clientUrl,
    credentials: true,
  },
});

/**
 * Trust proxy for Render/Cloud environments to correctly identify client IPs
 * and support rate limiting.
 */
app.set('trust proxy', 1);
app.set('io', io);

app.use(morganMiddleware);
app.use(performanceMiddleware);
app.use(helmet());
app.use(
  cors({
    origin: config.cors.clientUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Apply rate limiting to all /api routes
app.use('/api', apiRateLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Smart Inventory System API',
  });
});

app.get('/health', async (req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (e) {
    dbStatus = 'error';
  }

  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    dbState: dbStatus,
    redisState: redisClient.isOpen ? 'connected' : 'disconnected',
  });
});

app.use('/api', router);

io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

/**
 * Bootstraps the application by connecting to databases and starting the server.
 * Start server only when run directly (not when imported by tests).
 */
const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('🐘 Connected to PostgreSQL via Prisma');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    process.exit(1);
  }

  await connectRedis();

  server.listen(config.server.port, () => {
    logger.info(`🚀 Server running in ${config.server.nodeEnv} mode on port ${config.server.port}`);

    /**
     * Log Retention Job: Cleanup logs older than 90 days every 24 hours.
     * Prevents activity log table from growing indefinitely.
     */
    setInterval(
      async () => {
        try {
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

          const result = await prisma.activityLog.deleteMany({
            where: {
              timestamp: { lt: ninetyDaysAgo },
            },
          });

          if (result.count > 0) {
            logger.info(`🧹 Retention Policy: Deleted ${result.count} old activity logs.`);
          }
        } catch (error) {
          logger.error('Failed to run retention cleanup job:', error);
        }
      },
      24 * 60 * 60 * 1000,
    );
  });
};

if (require.main === module) {
  startServer();
}
