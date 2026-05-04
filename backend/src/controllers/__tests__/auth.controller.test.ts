import { signup, login, logout, refreshToken, me } from '../auth.controller';
import * as authService from '../../services/auth.service';
import { Request, Response } from 'express';

// Mock services
jest.mock('../../services/auth.service');
jest.mock('../../utils/activity-logger');

describe('Auth Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      cookies: {},
      ip: '127.0.0.1',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' } as any,
      get: jest.fn().mockReturnValue('mock-agent'),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('signup', () => {
    it('should call authService.signupUser and return 201', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com', role: 'Manager' };
      (authService.signupUser as jest.Mock).mockResolvedValue({
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      req.body = { email: 'test@example.com', password: 'password123' };
      await signup(req as Request, res as Response, next);

      expect(authService.signupUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({ id: 'user123' }),
          }),
        }),
      );
    });
  });

  describe('login', () => {
    it('should call authService.loginUser and return 200', async () => {
      const mockUser = { id: 'user123', email: 'login@example.com', role: 'Manager' };
      (authService.loginUser as jest.Mock).mockResolvedValue({
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      req.body = { email: 'login@example.com', password: 'password123' };
      await login(req as Request, res as Response, next);

      expect(authService.loginUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token and return 200', async () => {
      req.cookies = { refreshToken: 'old-token' };
      (authService.refreshAccessToken as jest.Mock).mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });

      await refreshToken(req as Request, res as Response, next);

      expect(authService.refreshAccessToken).toHaveBeenCalledWith('old-token');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 401 if no token provided', async () => {
      req.cookies = {};
      await refreshToken(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('logout', () => {
    it('should clear cookie and return 200', async () => {
      req.cookies = { refreshToken: 'token' };
      await logout(req as Request, res as Response, next);

      expect(authService.logoutUser).toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('me', () => {
    it('should return 200 and user info', async () => {
      (req as any).user = { id: 'u1', email: 'a@a.com', role: 'Admin' };
      await me(req as any, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            user: expect.objectContaining({ id: 'u1' }),
          }),
        }),
      );
    });
  });
});
