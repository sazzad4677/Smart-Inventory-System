import { validateRequest } from '../validateRequest.middleware';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

describe('validateRequest middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      cookies: {},
    };
    res = {};
    next = jest.fn();
  });

  const schema = z.object({
    body: z.object({
      name: z.string(),
    }),
  });

  it('should call next() if validation passes', async () => {
    req.body = { name: 'Valid Name' };
    const middleware = validateRequest(schema);

    await middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith();
    // Verify no error was passed
    expect((next as jest.Mock).mock.calls[0][0]).toBeUndefined();
  });

  it('should pass a ZodError to next() if validation fails', async () => {
    req.body = { name: 123 }; // Should be a string
    const middleware = validateRequest(schema);

    await middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    const error = (next as jest.Mock).mock.calls[0][0];
    expect(error.name).toBe('ZodError');
  });
});
