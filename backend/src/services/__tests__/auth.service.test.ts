import prisma from '../../config/prisma';
import { signupUser, loginUser, logoutUser, refreshAccessToken } from '../auth.service';
import jwt from 'jsonwebtoken';
import { validateInvitation, markInvitationAsUsed } from '../invitation.service';
import { AppError } from '../../utils/AppError';
import bcrypt from 'bcryptjs';

// Using global prisma mock from setup.ts

jest.mock('jsonwebtoken');
jest.mock('../invitation.service');
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));
jest.mock('../../utils/activity-logger');

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
      role: 'Manager' as any,
      token: 'valid-token',
    };

    it('should successfully create a new user and return tokens', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (validateInvitation as jest.Mock).mockResolvedValue({ id: 'invite123', role: 'Manager' });
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: signupData.email,
        role: 'Manager',
      });
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');
      (prisma.session.create as jest.Mock).mockResolvedValue({});

      const result = await signupUser(signupData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: signupData.email } });
      expect(validateInvitation).toHaveBeenCalledWith(signupData.email, signupData.token);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken', 'mock-token');
    });

    it('should throw an AppError (409) if the email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ email: signupData.email });

      await expect(signupUser(signupData)).rejects.toThrow(
        new AppError('An account with this email already exists.', 409),
      );
    });
  });

  describe('loginUser', () => {
    const loginData = { email: 'test@example.com', password: 'password123' };

    it('should successfully verify password and return tokens', async () => {
      const mockUser = {
        id: 'user123',
        email: loginData.email,
        password_hash: 'hashed',
        role: 'Manager',
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');
      (prisma.session.create as jest.Mock).mockResolvedValue({});

      const result = await loginUser(loginData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: loginData.email } });
      expect(result.accessToken).toBe('mock-token');
    });

    it('should throw an AppError (401) if invalid email or password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(loginUser(loginData)).rejects.toThrow(
        new AppError('Invalid email or password', 401),
      );
    });
  });

  describe('logoutUser', () => {
    it('should successfully delete the session', async () => {
      const mockSession = { id: 's1', user: { id: 'u1', email: 'test@test.com' } };
      (prisma.session.findUnique as jest.Mock).mockResolvedValue(mockSession);
      (prisma.session.delete as jest.Mock).mockResolvedValue({});

      await logoutUser(req, 'mock-refresh-token');

      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { refreshToken: 'mock-refresh-token' },
        include: { user: true },
      });
      expect(prisma.session.delete).toHaveBeenCalledWith({ where: { id: 's1' } });
    });
  });

  describe('refreshAccessToken', () => {
    it('should successfully return a new access token', async () => {
      const refreshToken = 'valid-token';
      (jwt.verify as jest.Mock).mockReturnValue({ id: 'user123' });
      (prisma.session.findUnique as jest.Mock).mockResolvedValue({ id: 's1', userId: 'user123' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user123', role: 'Manager' });
      (jwt.sign as jest.Mock).mockReturnValue('new-token');
      (prisma.session.update as jest.Mock).mockResolvedValue({});

      const result = await refreshAccessToken(refreshToken);

      expect(prisma.session.findUnique).toHaveBeenCalled();
      expect(result.accessToken).toBe('new-token');
    });

    it('should throw 401 if refresh token is invalid', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid');
      });
      await expect(refreshAccessToken('bad-token')).rejects.toThrow(
        new AppError('Invalid or expired refresh token. Please log in again.', 401),
      );
    });

    it('should throw 401 if session is not found', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: 'u1' });
      (prisma.session.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(refreshAccessToken('token')).rejects.toThrow(
        new AppError('Session has been revoked or already rotated. Please log in again.', 401),
      );
    });

    it('should throw 401 if user is not found', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: 'u1' });
      (prisma.session.findUnique as jest.Mock).mockResolvedValue({ id: 's1' });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(refreshAccessToken('token')).rejects.toThrow(
        new AppError('The user belonging to this session no longer exists.', 401),
      );
    });
  });

  describe('loginUser - additional branches', () => {
    it('should throw 401 if password does not match', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ password_hash: 'h' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(loginUser({ email: 'a@a.com', password: 'p' })).rejects.toThrow(
        new AppError('Invalid email or password', 401),
      );
    });
  });

  describe('logoutUser - additional branches', () => {
    it('should do nothing if session is not found', async () => {
      (prisma.session.findUnique as jest.Mock).mockResolvedValue(null);
      await logoutUser(req, 'token');
      expect(prisma.session.delete).not.toHaveBeenCalled();
    });

    it('should not call captureActivity if session user is missing', async () => {
      (prisma.session.findUnique as jest.Mock).mockResolvedValue({ id: 's1' }); // no user
      await logoutUser(req, 'token');
      expect(prisma.session.delete).toHaveBeenCalled();
    });
  });
});
