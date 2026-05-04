import request from 'supertest';
import { app } from '../../__tests__/integration.setup';
import prisma from '../../config/prisma';
import { UserRole } from '../../types';
import jwt from 'jsonwebtoken';
import { config } from '../../config/config';

describe('User Controller Integration Tests', () => {
  let adminToken: string;
  let managerToken: string;

  beforeEach(async () => {
    adminToken = jwt.sign({ id: 'admin1', role: UserRole.Admin }, config.jwt.accessSecret, {
      expiresIn: '1h',
    });
    managerToken = jwt.sign({ id: 'manager1', role: UserRole.Manager }, config.jwt.accessSecret, {
      expiresIn: '1h',
    });

    // Mock auth middleware requirements
    (prisma.user.findUnique as jest.Mock).mockImplementation(({ where }: any) => {
      if (where.id === 'admin1') return Promise.resolve({ id: 'admin1', role: UserRole.Admin });
      if (where.id === 'manager1')
        return Promise.resolve({ id: 'manager1', role: UserRole.Manager });
      return Promise.resolve(null);
    });
    (prisma.session.findUnique as jest.Mock).mockResolvedValue({ id: 's1' });
  });

  describe('GET /api/users', () => {
    it('should allow Admin to fetch all users', async () => {
      const mockUsers = [
        { id: 'u1', email: 'a@a.com', role: 'Admin', createdAt: new Date(), sessions: [] },
      ];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);

      if (res.status !== 200) console.log('DEBUG USER 500:', JSON.stringify(res.body, null, 2));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should deny Manager access to users list', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/users/:userId/sessions', () => {
    it('should allow Admin to revoke sessions', async () => {
      (prisma.session.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const res = await request(app)
        .delete(`/api/users/u1/sessions`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });
});
