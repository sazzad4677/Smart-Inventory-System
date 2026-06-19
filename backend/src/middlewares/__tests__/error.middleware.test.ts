import { globalErrorHandler } from '../error.middleware';
import { AppError } from '../../utils/AppError';
import { config } from '../../config/config';
import { Request, Response, NextFunction } from 'express';

// Mock config to control behavior (default to production for testing handlers)
jest.mock('../../config/config', () => ({
  config: {
    server: {
      nodeEnv: 'production',
    },
  },
}));

describe('Error Middleware - globalErrorHandler', () => {
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

  it('should handle standard generic Error and return 500 in production', () => {
    const error = new Error('Database connection failed');

    globalErrorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      status: 'error',
      message: 'Something went wrong!',
    });
  });

  it('should handle AppError and return its specific status code and message', () => {
    const error = new AppError('Resource not found', 404);

    globalErrorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      status: 'fail',
      message: 'Resource not found',
    });
  });

  it('should handle Duplicate Key Error (code 11000) with a 400 status', () => {
    const error: any = new Error();
    error.code = 11000;
    error.errmsg =
      'E11000 duplicate key error collection: index: email_1 dup key: { email: "test@example.com" }';

    globalErrorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Duplicate field value'),
      }),
    );
  });

  it('should handle JWT expiration errors with a 401 status', () => {
    const error: any = new Error();
    error.name = 'TokenExpiredError';

    globalErrorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('expired'),
      }),
    );
  });

  it('should handle CastError with 400 status', () => {
    const error: any = new Error();
    error.name = 'CastError';
    error.path = '_id';
    error.value = 'invalid-id';

    globalErrorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid _id: invalid-id.',
      }),
    );
  });

  it('should handle ValidationError with 400 status', () => {
    const error: any = new Error();
    error.name = 'ValidationError';
    error.errors = {
      name: { message: 'Path `name` is required.' },
    };

    globalErrorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Invalid input data'),
      }),
    );
  });

  it('should handle JsonWebTokenError with 401 status', () => {
    const error: any = new Error();
    error.name = 'JsonWebTokenError';

    globalErrorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid token. Please log in again!',
      }),
    );
  });
});
