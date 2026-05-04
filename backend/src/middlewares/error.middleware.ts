import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { config } from '../config/config';
import { logger } from '../utils/logger';

interface ExtendedError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: number | string;
  path?: string;
  value?: string;
  errmsg?: string;
  errors?: Record<string, { message: string }>;
}

const handleCastErrorDB = (err: ExtendedError) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: ExtendedError) => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0] || 'unknown';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: ExtendedError) => {
  const errors = err.errors ? Object.values(err.errors).map((el) => el.message) : [];
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleVersionErrorDB = () =>
  new AppError('This record has been updated by another user. Please refresh and try again.', 409);

const handleZodError = (err: ZodError) => {
  const errors = err.issues.map((el) => el.message);
  const message = errors.join('. ');
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err: ExtendedError, res: Response) => {
  res.status(err.statusCode || 500).json({
    success: false,
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: ExtendedError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

export const globalErrorHandler = (
  err: ExtendedError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (err.name === 'JsonWebTokenError') err = handleJWTError();
  if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (config.server.nodeEnv === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message, name: err.name };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000 || error.code === '11000') error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'VersionError') error = handleVersionErrorDB();
    if (error.name === 'ZodError' || error instanceof ZodError)
      error = handleZodError(error as unknown as ZodError);
    sendErrorProd(error, res);
  }
};
