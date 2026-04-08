import { signupUser, loginUser, logoutUser } from '../services/auth.service';
import User from '../models/user.model';
import Session from '../models/session.model';
import ActivityLog from '../models/activity-log.model';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

// Mock dependencies
jest.mock('../models/user.model');
jest.mock('../models/session.model');
jest.mock('../models/activity-log.model');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signupUser', () => {
    const signupData = {
      email: 'test@example.com',
      password: 'password123',
      role: 'manager' as any,
    };

    it('should successfully create a new user, create a session, and return tokens', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      const mockUser = { _id: 'user123', email: signupData.email, role: signupData.role };
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');
      (Session.create as jest.Mock).mockResolvedValue({});

      const result = await signupUser(signupData);

      expect(User.findOne).toHaveBeenCalledWith({ email: signupData.email });
      expect(User.create).toHaveBeenCalledWith({
        email: signupData.email,
        password_hash: signupData.password,
        role: signupData.role,
      });
      expect(Session.create).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken', 'mock-token');
      expect(result).toHaveProperty('refreshToken', 'mock-token');
    });

    it('should throw an AppError (409) if the email already exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ email: signupData.email });

      await expect(signupUser(signupData)).rejects.toThrow(
        new AppError('An account with this email already exists.', 409),
      );
    });
  });

  describe('loginUser', () => {
    const loginData = { email: 'test@example.com', password: 'password123' };

    it('should successfully verify password, create a session, and return tokens', async () => {
      const mockUser = {
        _id: 'user123',
        email: loginData.email,
        role: 'manager',
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');
      (Session.create as jest.Mock).mockResolvedValue({});

      const result = await loginUser(loginData);

      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginData.password);
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
    });

    it('should throw an AppError (401) if invalid email or password', async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(loginUser(loginData)).rejects.toThrow(
        new AppError('Invalid email or password', 401),
      );
    });

    it('should throw an AppError (401) if password does not match', async () => {
      const mockUser = {
        _id: 'user123',
        email: loginData.email,
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(loginUser(loginData)).rejects.toThrow(
        new AppError('Invalid email or password', 401),
      );
    });
  });

  describe('logoutUser', () => {
    it('should successfully delete the session by refresh token', async () => {
      const mockSession = {
        _id: 'session123',
        userId: 'user123',
        deleteOne: jest.fn().mockResolvedValue({}),
      };
      (Session.findOne as jest.Mock).mockResolvedValue(mockSession);
      (User.findById as jest.Mock).mockResolvedValue({ _id: 'user123', email: 'test@test.com' });
      (ActivityLog.create as jest.Mock).mockResolvedValue({});

      await logoutUser('mock-refresh-token');

      expect(Session.findOne).toHaveBeenCalledWith({ refreshToken: 'mock-refresh-token' });
      expect(mockSession.deleteOne).toHaveBeenCalled();
    });
  });
});
