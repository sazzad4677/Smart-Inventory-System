import jwt from 'jsonwebtoken';
import { protect, restrictTo } from '../auth.middleware';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../../types';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../config/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    session: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Auth Middleware - protect', () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      headers: {},
    };
    res = {};
    next = jest.fn();
  });

  it('should call next with error if no authorization header is provided', async () => {
    await protect(req as AuthenticatedRequest, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('not logged in');
  });

  it('should call next with error if token is invalid or expired', async () => {
    req.headers!.authorization = 'Bearer invalid-token';
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });

    await protect(req as AuthenticatedRequest, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('invalid or expired');
  });

  it('should call next with error if session does not exist', async () => {
    req.headers!.authorization = 'Bearer valid-token';
    const decoded = { id: 'user123', sessionId: 'session123' };
    (jwt.verify as jest.Mock).mockReturnValue(decoded);

    (prisma.session.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user123' });

    await protect(req as AuthenticatedRequest, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('Session has been revoked');
  });

  it('should attach user to req and call next if token and session are valid', async () => {
    req.headers!.authorization = 'Bearer valid-token';
    const decoded = { id: 'user123', sessionId: 'session123' };
    (jwt.verify as jest.Mock).mockReturnValue(decoded);

    const mockUser = { id: 'user123', email: 'test@test.com', role: UserRole.Manager };
    const mockSession = { id: 'session123' };

    (prisma.session.findUnique as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    await protect(req as AuthenticatedRequest, res as Response, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalledWith();
  });

  it('should call next with error if user no longer exists', async () => {
    req.headers!.authorization = 'Bearer valid-token';
    const decoded = { id: 'missing-user', sessionId: 's1' };
    (jwt.verify as jest.Mock).mockReturnValue(decoded);
    (prisma.session.findUnique as jest.Mock).mockResolvedValue({ id: 's1' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await protect(req as AuthenticatedRequest, res as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0];
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('no longer exists');
  });
});

describe('Auth Middleware - restrictTo', () => {
  let req: Partial<AuthenticatedRequest>, res: Partial<Response>, next: NextFunction;

  beforeEach(() => {
    req = { user: { role: UserRole.Manager } as any };
    res = {};
    next = jest.fn();
  });

  it('should call next if role is allowed', () => {
    const middleware = restrictTo(UserRole.Admin, UserRole.Manager);
    middleware(req as AuthenticatedRequest, res as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should throw 403 error if role is not allowed', () => {
    const middleware = restrictTo(UserRole.Admin);
    middleware(req as AuthenticatedRequest, res as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0];
    expect(error.statusCode).toBe(403);
  });

  it('should throw 401 if user or role is missing', () => {
    req.user = undefined;
    const middleware = restrictTo(UserRole.Admin);
    middleware(req as AuthenticatedRequest, res as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });
});
