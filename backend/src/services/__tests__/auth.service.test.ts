import mongoose from 'mongoose';
import { signupUser, loginUser, logoutUser, refreshAccessToken } from '../auth.service';
import User from '../../models/user.model';
import Session from '../../models/session.model';
import ActivityLog from '../../models/activity-log.model';
import jwt from 'jsonwebtoken';
import { validateInvitation, markInvitationAsUsed } from '../invitation.service';
import { AppError } from '../../utils/AppError';

// Mock dependencies
jest.mock('../../models/user.model');
jest.mock('../../models/session.model');
jest.mock('../../models/activity-log.model');
jest.mock('jsonwebtoken');
jest.mock('../invitation.service');
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('Auth Service', () => {
  let req: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      ip: '127.0.0.1',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn().mockReturnValue('mock-agent'),
    };
  });

  describe('signupUser', () => {
    const signupData = {
      email: 'test@example.com',
      password: 'password123',
      role: 'manager' as any,
      token: 'valid-token',
    };

    it('should successfully create a new user, create a session, and return tokens', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      const mockUser = { _id: 'user123', email: signupData.email, role: signupData.role };
      const mockInvitation = { _id: 'invite123', role: signupData.role };
      (validateInvitation as jest.Mock).mockResolvedValue(mockInvitation);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');
      (Session.create as jest.Mock).mockResolvedValue({});

      const result = await signupUser(signupData);

      expect(User.findOne).toHaveBeenCalledWith({ email: signupData.email });
      expect(validateInvitation).toHaveBeenCalledWith(signupData.email, signupData.token);
      expect(User.create).toHaveBeenCalledWith({
        email: signupData.email,
        password_hash: signupData.password,
        role: signupData.role,
      });
      expect(markInvitationAsUsed).toHaveBeenCalledWith('invite123');
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
      const userId = new mongoose.Types.ObjectId();
      const mockSession = { deleteOne: jest.fn().mockResolvedValue({}) };
      (Session.findOne as jest.Mock).mockResolvedValue(mockSession);
      (User.findById as jest.Mock).mockResolvedValue({ email: 'test@test.com' });

      await logoutUser(req, 'mock-refresh-token');

      expect(Session.findOne).toHaveBeenCalledWith({ refreshToken: 'mock-refresh-token' });
      expect(mockSession.deleteOne).toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('should successfully return a new access token for a valid refresh token', async () => {
      const refreshToken = 'valid-token';
      const mockDecoded = { id: 'user123' };
      const userId = new mongoose.Types.ObjectId();
      const mockSession = { _id: 'session123', userId, save: jest.fn().mockResolvedValue({}) };
      const mockUser = { _id: 'user123', role: 'manager' };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      (Session.findOne as jest.Mock).mockResolvedValue(mockSession);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('new-token');

      const result = await refreshAccessToken(refreshToken);

      expect(jwt.verify).toHaveBeenCalledWith(refreshToken, expect.any(String));
      expect(Session.findOne).toHaveBeenCalledWith({ refreshToken });
      expect(result.accessToken).toBe('new-token');
      expect(result.refreshToken).toBe('new-token');
      expect(mockSession.save).toHaveBeenCalled();
    });

    it('should throw 401 if refresh token verification fails', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(refreshAccessToken('invalid')).rejects.toThrow(
        new AppError('Invalid or expired refresh token. Please log in again.', 401),
      );
    });

    it('should throw 401 if session is not found in DB', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: 'user123' });
      (Session.findOne as jest.Mock).mockResolvedValue(null);

      await expect(refreshAccessToken('valid-but-no-session')).rejects.toThrow(
        new AppError('Session has been revoked or already rotated. Please log in again.', 401),
      );
    });

    it('should throw 401 if user is not found', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: 'missing' });
      (Session.findOne as jest.Mock).mockResolvedValue({ _id: 's1' });
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(refreshAccessToken('token')).rejects.toThrow(
        new AppError('The user belonging to this session no longer exists.', 401),
      );
    });
  });
});
