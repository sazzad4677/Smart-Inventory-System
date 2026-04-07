import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import User from '../models/user.model';
import { config } from '../config/config';

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Get token from Authorization header
  let token: string | undefined;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // Verify token
  let decoded: jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, config.jwt.accessSecret) as jwt.JwtPayload;
  } catch {
    return next(new AppError('Access token is invalid or expired.', 401));
  }

  // Check user exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  (req as any).user = currentUser;
  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user?.role) {
      return next(new AppError('You are not logged in or your role is undefined.', 401));
    }
    if (!roles.includes(user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};
