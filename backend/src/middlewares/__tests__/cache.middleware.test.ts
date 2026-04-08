import { checkCache } from '../cache.middleware';
import { redisClient } from '../../config/redis';
import { Request, Response, NextFunction } from 'express';

// Mock redis client
jest.mock('../../config/redis', () => ({
  redisClient: {
    get: jest.fn(),
  },
}));

describe('Cache Middleware - checkCache', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should call next() if no data is found in Redis (cache miss)', async () => {
    (redisClient.get as jest.Mock).mockResolvedValue(null);

    const middleware = checkCache('test-key');
    await middleware(req as Request, res as Response, next);

    expect(redisClient.get).toHaveBeenCalledWith('test-key');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 200 with cached data if data exists in Redis (cache hit)', async () => {
    const mockData = { stats: { orders: 10 } };
    (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

    const middleware = checkCache('test-key');
    await middleware(req as Request, res as Response, next);

    expect(redisClient.get).toHaveBeenCalledWith('test-key');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Data fetched from cache',
      data: mockData,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() if Redis throws an error', async () => {
    (redisClient.get as jest.Mock).mockRejectedValue(new Error('Redis Down'));

    const middleware = checkCache('test-key');
    await middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
