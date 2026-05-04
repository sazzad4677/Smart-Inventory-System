import request from 'supertest';
import { app } from '../../__tests__/integration.setup';
import prisma from '../../config/prisma';
import { UserRole } from '../../types';
import jwt from 'jsonwebtoken';
import { config } from '../../config/config';

describe('Order API Integration', () => {
  let adminToken: string;

  beforeEach(() => {
    adminToken = jwt.sign(
      { id: 'admin1', role: UserRole.Admin, sessionId: 's1' },
      config.jwt.accessSecret,
    );
    (prisma.session.findUnique as jest.Mock).mockResolvedValue({ id: 's1' });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'admin1', role: UserRole.Admin });
  });

  describe('POST /api/orders', () => {
    it('should create an order', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue({
        id: 'p1',
        name: 'Product 1',
        stock_quantity: 10,
        price: 100,
        status: 'Active',
      });
      (prisma.order.create as jest.Mock).mockResolvedValue({ id: 'o1', total_price: 100 });
      (prisma.product.update as jest.Mock).mockResolvedValue({});
      (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customer_name: 'John Doe',
          items: [{ product_id: 'p1', quantity: 1 }],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBe('o1');
    });
  });
});
