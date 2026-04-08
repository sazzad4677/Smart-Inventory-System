import { catchAsync } from '../catchAsync';
import { Request, Response, NextFunction } from 'express';

describe('catchAsync utility', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should successfully execute the wrapped async function', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    const wrappedFn = catchAsync(mockFn);

    await wrappedFn(req as Request, res as Response, next);

    expect(mockFn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should catch errors and pass them to next', async () => {
    const error = new Error('Async error');
    const mockFn = jest.fn().mockRejectedValue(error);
    const wrappedFn = catchAsync(mockFn);

    // catchAsync returns (req, res, next) => { Promise.resolve(fn()).catch(next) }
    await wrappedFn(req as Request, res as Response, next);

    expect(mockFn).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
