import { globalErrorHandler } from '../error.middleware';
import { Request, Response, NextFunction } from 'express';

// Mock config to control behavior - Development mode
jest.mock('../../config/config', () => ({
  config: {
    server: {
      nodeEnv: 'development',
    },
  },
}));

describe('Error Middleware - globalErrorHandler (Development)', () => {
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

  it('should return detailed error object in development environment', () => {
    const error = new Error('Detailed development error') as any;
    error.statusCode = 401;

    globalErrorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Detailed development error',
        stack: expect.any(String),
        error: expect.any(Object),
      }),
    );
  });
});
