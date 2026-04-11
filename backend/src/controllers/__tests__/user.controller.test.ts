import request from 'supertest';
import { app } from '../../__tests__/integration.setup';
import User from '../../models/user.model';
import Session from '../../models/session.model';
import { UserRole } from '../../types';
import jwt from 'jsonwebtoken';
import { config } from '../../config/config';
import { Types } from 'mongoose';

describe('User Controller Integration Tests', () => {
  let adminToken: string;
  let managerToken: string;
  let adminUser: any;
  let regularUser: any;

  beforeEach(async () => {
    // 1. Setup Admin
    adminUser = await User.create({
      email: 'admin-controller@test.com',
      password_hash: 'Password123!',
      role: UserRole.Admin,
    });
    adminToken = jwt.sign({ id: adminUser._id, role: UserRole.Admin }, config.jwt.accessSecret, {
      expiresIn: '1h',
    });

    // 2. Setup Manager
    const managerUser = await User.create({
      email: 'manager-controller@test.com',
      password_hash: 'Password123!',
      role: UserRole.Manager,
    });
    managerToken = jwt.sign(
      { id: managerUser._id, role: UserRole.Manager },
      config.jwt.accessSecret,
      { expiresIn: '1h' },
    );

    // 3. Setup Regular User
    regularUser = await User.create({
      email: 'user-controller@test.com',
      password_hash: 'Password123!',
      role: UserRole.Staff,
    });
  });

  describe('GET /api/users', () => {
    it('should allow Admin to fetch all users', async () => {
      const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      // Should have at least the 3 users we created
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should deny Manager access to users list', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:userId/sessions', () => {
    it('should allow Admin to revoke sessions', async () => {
      // Seed a session for regular user
      await Session.create({
        _id: new Types.ObjectId(),
        userId: regularUser._id,
        refreshToken: 'some-token',
        expiresAt: new Date(Date.now() + 3600000),
      });

      const res = await request(app)
        .delete(`/api/users/${regularUser._id}/sessions`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/revoked/i);

      const sessionCount = await Session.countDocuments({ userId: regularUser._id });
      expect(sessionCount).toBe(0);
    });

    it('should return 403 when Manager tries to revoke sessions', async () => {
      const res = await request(app)
        .delete(`/api/users/${regularUser._id}/sessions`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(403);
    });
  });
});
