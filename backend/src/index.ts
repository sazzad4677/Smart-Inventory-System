import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';

import { config } from './config/config';
import connectDB from './config/db';
import { connectRedis } from './config/redis';
import { apiRateLimiter } from './middlewares/rateLimiter.middleware';
import { globalErrorHandler } from './middlewares/error.middleware';
import router from './routes';
import { AppError } from './utils/AppError';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './docs/swagger';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.cors.clientUrl,
    credentials: true,
  },
});

// Attach Socket.io instance to app for use in controllers
app.set('io', io);

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

// Global Rate Limiter
app.use('/api', apiRateLimiter);

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Smart Inventory System API',
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.use('/api', router);

// Socket.io Connection Event
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// 404 Not Found Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

// Start server after DB and Redis connection
const startServer = async () => {
  await connectDB();
  await connectRedis();

  server.listen(config.server.port, () => {
    console.log(`🚀 Server running in ${config.server.nodeEnv} mode on port ${config.server.port}`);
  });
};

startServer();
