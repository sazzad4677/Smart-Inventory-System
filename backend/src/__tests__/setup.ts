// Global setup for infrastructure mocks

// 1. Mock the logger utility
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  },
}));

// 2. Mock mongoose
jest.mock('mongoose', () => {
  const mongoose = jest.requireActual('mongoose');
  mongoose.connect = jest.fn().mockResolvedValue(mongoose);
  return mongoose;
});

// 3. Mock Redis client config
jest.mock('../config/redis', () => ({
  redisClient: {
    on: jest.fn(),
    isOpen: true,
    connect: jest.fn().mockResolvedValue(true),
    quit: jest.fn().mockResolvedValue(true),
    sendCommand: jest.fn().mockResolvedValue(true),
  },
  connectRedis: jest.fn().mockResolvedValue(true),
}));

// 4. Mock the API Metric model
jest.mock('../models/ApiMetric.model', () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockResolvedValue(true),
    insertOne: jest.fn().mockResolvedValue(true),
  },
}));

// 5. Mock the Rate Limiter Middleware completely
jest.mock('../middlewares/rateLimiter.middleware', () => ({
  apiRateLimiter: (req: any, res: any, next: any) => next(),
  loginRateLimiter: (req: any, res: any, next: any) => next(),
  authRateLimiter: (req: any, res: any, next: any) => next(),
}));

beforeAll(() => {
  jest.clearAllMocks();
});
