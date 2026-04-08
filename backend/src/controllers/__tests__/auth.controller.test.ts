import { signup, login, logout, refreshToken } from '../auth.controller';
import * as authService from '../../services/auth.service';
import { Request, Response } from 'express';

// Mock auth service
jest.mock('../../services/auth.service');

describe('Auth Controller', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
    next = jest.fn();
  });

  describe('signup', () => {
    it('should call authService.signupUser, set cookie, and return 201 with data', async () => {
      req.body = { email: 'test@example.com', password: 'password123', role: 'manager' };
      const mockResult = {
        user: { _id: 'user123', email: req.body.email, role: req.body.role },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      (authService.signupUser as jest.Mock).mockResolvedValue(mockResult);

      await signup(req as Request, res as Response, next);

      expect(authService.signupUser).toHaveBeenCalledWith(req.body);
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Account created successfully.',
        data: {
          accessToken: 'access-token',
          user: { id: 'user123', email: 'test@example.com', role: 'manager' },
        },
      });
    });

    it('should call next(error) if service throws', async () => {
      const error = new Error('Signup failed');
      (authService.signupUser as jest.Mock).mockRejectedValue(error);

      await signup(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should call authService.loginUser, set cookie, and return 200 with data', async () => {
      req.body = { email: 'login@example.com', password: 'password123' };
      const mockResult = {
        user: { _id: 'user123', email: req.body.email, role: 'manager' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      (authService.loginUser as jest.Mock).mockResolvedValue(mockResult);

      await login(req as Request, res as Response, next);

      expect(authService.loginUser).toHaveBeenCalledWith(req.body);
      expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User logged in successfully.',
        data: {
          accessToken: 'access-token',
          user: { id: 'user123', email: 'login@example.com', role: 'manager' },
        },
      });
    });
  });

  describe('logout', () => {
    it('should call authService.logoutUser, clear cookie, and return 200', async () => {
      req.body = { refreshToken: 'mock-refresh-token' };

      await logout(req as Request, res as Response, next);

      expect(authService.logoutUser).toHaveBeenCalledWith('mock-refresh-token');
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Logged out successfully.',
        }),
      );
    });

    it('should clear cookie and return 200 even if no refresh token is provided', async () => {
      req.body = {};

      await logout(req as Request, res as Response, next);

      expect(authService.logoutUser).not.toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('refreshToken', () => {
    it('should call authService.refreshAccessToken and return 200 with new access token', async () => {
      req.body = { refreshToken: 'valid-refresh-token' };
      (authService.refreshAccessToken as jest.Mock).mockResolvedValue({
        accessToken: 'new-access-token',
      });

      await refreshToken(req as Request, res as Response, next);

      expect(authService.refreshAccessToken).toHaveBeenCalledWith('valid-refresh-token');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { accessToken: 'new-access-token' },
        }),
      );
    });

    it('should return 401 if no refresh token is provided', async () => {
      req.body = {};

      await refreshToken(req as Request, res as Response, next);

      expect(authService.refreshAccessToken).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
