import request from 'supertest';
import { app } from '../../__tests__/integration.setup';
import prisma from '../../config/prisma';
import { UserRole } from '../../types';
import jwt from 'jsonwebtoken';
import { config } from '../../config/config';

describe('Activity Log API Integration', () => {
  let adminToken: string;

  beforeEach(() => {
    adminToken = jwt.sign(
      { id: 'admin1', role: UserRole.Admin, sessionId: 's1' },
      config.jwt.accessSecret,
    );
    (prisma.session.findUnique as jest.Mock).mockResolvedValue({ id: 's1' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'admin1', role: UserRole.Admin });
  });

  describe('GET /api/activity-logs', () => {
    it('should return activity logs', async () => {
      (prisma.activityLog.findMany as jest.Mock).mockResolvedValue([
        { id: 'l1', action_text: 'Test' },
      ]);
      (prisma.activityLog.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app)
        .get('/api/activity-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });
});
