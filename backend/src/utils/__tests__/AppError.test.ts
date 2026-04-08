import { AppError } from '../AppError';

describe('AppError class', () => {
  it('should correctly set the message and statusCode', () => {
    const error = new AppError('Test error', 400);

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.status).toBe('fail');
    expect(error.isOperational).toBe(true);
  });

  it('should set status to "fail" for 4xx errors', () => {
    const error = new AppError('Client error', 404);
    expect(error.status).toBe('fail');
  });

  it('should set status to "error" for 5xx errors', () => {
    const error = new AppError('Server error', 500);
    expect(error.status).toBe('error');
  });

  it('should capture stack trace', () => {
    const error = new AppError('Error with stack', 500);
    expect(error.stack).toBeDefined();
  });
});
