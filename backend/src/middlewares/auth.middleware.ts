import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import User from '../models/user.model';

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Getting token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification of token
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // decoded payload to req.user for use in middleware and controllers
  req.user = currentUser;

  next();
});

// Middleware to restrict access based on roles
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return next(new AppError('You are not logged in or your role is undefined.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};
