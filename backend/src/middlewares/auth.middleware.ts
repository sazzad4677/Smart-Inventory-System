import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import prisma from '../config/prisma';
import { config } from '../config/config';
import { IUser, AuthenticatedRequest, UserRole } from '../types';

const extractBearerToken = (req: Request): string | undefined => {
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return undefined;
};

/**
 * Middleware to protect routes. Verifies the JWT access token and ensures
 * the associated user and session still exist in the database.
 */
export const protect = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = extractBearerToken(req);

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt.accessSecret) as jwt.JwtPayload;
    } catch {
      return next(new AppError('Access token is invalid or expired.', 401));
    }

    let sessionPromise = Promise.resolve(true);
    if (decoded.sessionId) {
      sessionPromise = prisma.session
        .findUnique({
          where: { id: decoded.sessionId },
        })
        .then((s) => !!s);
    }

    const [sessionExists, currentUser] = await Promise.all([
      sessionPromise,
      prisma.user.findUnique({
        where: { id: decoded.id },
      }),
    ]);

    if (!sessionExists) {
      return next(new AppError('Session has been revoked or expired. Please log in again.', 401));
    }

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = currentUser as IUser;
    next();
  },
);

/**
 * Middleware to restrict access to specific roles.
 * Must be used after the 'protect' middleware.
 */
export const restrictTo = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user?.role) {
      return next(new AppError('You are not logged in or your role is undefined.', 401));
    }
    if (!roles.includes(user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};
