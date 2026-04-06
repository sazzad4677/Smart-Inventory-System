import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { config } from './config/config';
import connectDB from './config/db';
import { connectRedis } from './config/redis';
import { globalErrorHandler } from './middlewares/error.middleware';
import router from './routes';

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: config.cors.clientUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.use('/api', router);

// Global Error Handler
app.use(globalErrorHandler);

// Start server after DB and Redis connection
const startServer = async () => {
  await connectDB();
  await connectRedis();

  app.listen(config.server.port, () => {
    console.log(`🚀 Server running in ${config.server.nodeEnv} mode on port ${config.server.port}`);
  });
};

startServer();
