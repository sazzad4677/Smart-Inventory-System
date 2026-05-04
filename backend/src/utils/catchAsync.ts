import { Request, Response, NextFunction, RequestHandler } from 'express';

export const catchAsync =
  <T extends Request>(
    fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>,
  ): RequestHandler =>
  (req, res, next) => {
    return Promise.resolve(fn(req as T, res, next)).catch(next);
  };
