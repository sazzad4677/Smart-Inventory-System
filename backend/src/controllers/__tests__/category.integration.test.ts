import request from 'supertest';
import { app } from '../../__tests__/integration.setup';
import prisma from '../../config/prisma';
import { UserRole } from '../../types';
import jwt from 'jsonwebtoken';
import { config } from '../../config/config';

describe('Category API Integration', () => {
  let adminToken: string;

  beforeEach(() => {
    adminToken = jwt.sign(
      { id: 'admin1', role: UserRole.Admin, sessionId: 's1' },
      config.jwt.accessSecret,
    );
    (prisma.session.findUnique as jest.Mock).mockResolvedValue({ id: 's1' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'admin1', role: UserRole.Admin });
  });

  describe('GET /api/categories', () => {
    it('should return categories', async () => {
      (prisma.category.findMany as jest.Mock).mockResolvedValue([
        { id: 'c1', name: 'Electronics' },
      ]);

      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/categories', () => {
    it('should create a category', async () => {
      (prisma.category.create as jest.Mock).mockResolvedValue({ id: 'c1', name: 'New Cat' });

      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New Cat' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('New Cat');
    });
  });
});
