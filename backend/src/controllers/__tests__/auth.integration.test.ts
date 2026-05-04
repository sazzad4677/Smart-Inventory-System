import request from 'supertest';
import { app } from '../../__tests__/integration.setup';
import prisma from '../../config/prisma';
import bcrypt from 'bcryptjs';

describe('Auth API Integration', () => {
  const registerPayload = {
    email: 'newuser@example.com',
    password: 'Password123!',
  };

  describe('POST /api/auth/signup', () => {
    it('should successfully register a new user and return 201', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.invitation.findFirst as jest.Mock).mockResolvedValue({
        id: 'inv1',
        email: registerPayload.email,
        token: 'valid-token',
        role: 'Manager',
        expiresAt: new Date(Date.now() + 3600000),
      });
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'u1',
        email: registerPayload.email,
        role: 'Manager',
      });
      (prisma.session.create as jest.Mock).mockResolvedValue({});
      (prisma.invitation.update as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ ...registerPayload, token: 'valid-token' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should successfully log in and return 200', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        password_hash: hashedPassword,
        role: 'Manager',
      });
      (prisma.session.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
