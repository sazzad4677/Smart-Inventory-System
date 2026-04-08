import { Request, Response, NextFunction } from 'express';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
