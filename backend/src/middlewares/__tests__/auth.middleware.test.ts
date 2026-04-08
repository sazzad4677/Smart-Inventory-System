import jwt from 'jsonwebtoken';
import { protect, restrictTo } from '../auth.middleware';
import User from '../../models/user.model';
import Session from '../../models/session.model';
import { AppError } from '../../utils/AppError';
import { Request, Response, NextFunction } from 'express';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../models/user.model');
jest.mock('../../models/session.model');

describe('Auth Middleware - protect', () => {
  let req: any;
  let res: any;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      headers: {},
    };
    res = {};
    next = jest.fn() as any;
  });

  it('should call next with error if no authorization header is provided', async () => {
    await protect(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('not logged in');
  });

  it('should call next with error if token is invalid or expired', async () => {
    req.headers.authorization = 'Bearer invalid-token';
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });

    await protect(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('invalid or expired');
  });

  it('should call next with error if session does not exist', async () => {
    req.headers.authorization = 'Bearer valid-token';
    const decoded = { id: 'user123', sessionId: 'session123' };
    (jwt.verify as jest.Mock).mockReturnValue(decoded);

    (Session.findById as jest.Mock).mockResolvedValue(null);
    (User.findById as jest.Mock).mockResolvedValue({ _id: 'user123' });

    await protect(req as any, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('Session has been revoked');
  });

  it('should attach user to req and call next if token and session are valid', async () => {
    req.headers.authorization = 'Bearer valid-token';
    const decoded = { id: 'user123', sessionId: 'session123' };
    (jwt.verify as jest.Mock).mockReturnValue(decoded);

    const mockUser = { _id: 'user123', email: 'test@test.com' };
    const mockSession = { _id: 'session123' };

    (Session.findById as jest.Mock).mockResolvedValue(mockSession);
    (User.findById as jest.Mock).mockResolvedValue(mockUser);

    await protect(req as any, res as Response, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalledWith();
  });

  it('should call next with error if user no longer exists', async () => {
    req.headers.authorization = 'Bearer valid-token';
    const decoded = { id: 'missing-user', sessionId: 's1' };
    (jwt.verify as jest.Mock).mockReturnValue(decoded);
    (Session.findById as jest.Mock).mockResolvedValue({ _id: 's1' });
    (User.findById as jest.Mock).mockResolvedValue(null);

    await protect(req as any, res as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('no longer exists');
  });
});

describe('Auth Middleware - restrictTo', () => {
  let req: any, res: any, next: NextFunction;

  beforeEach(() => {
    req = { user: { role: 'Manager' } };
    res = {};
    next = jest.fn() as any;
  });

  it('should call next if role is allowed', () => {
    const middleware = restrictTo('Admin', 'Manager');
    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should throw 403 error if role is not allowed', () => {
    const middleware = restrictTo('Admin');
    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0];
    expect(error.statusCode).toBe(403);
  });

  it('should throw 401 if user or role is missing', () => {
    req.user = null;
    const middleware = restrictTo('Admin');
    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });
});
