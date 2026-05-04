import request from 'supertest';
import { app } from '../../__tests__/integration.setup';
import prisma from '../../config/prisma';
import { UserRole } from '../../types';
import jwt from 'jsonwebtoken';
import { config } from '../../config/config';

describe('Product API Integration', () => {
  let adminToken: string;

  beforeEach(() => {
    adminToken = jwt.sign({ id: 'admin1', role: UserRole.Admin }, config.jwt.accessSecret);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'admin1', role: UserRole.Admin });
    (prisma.session.findUnique as jest.Mock).mockResolvedValue({ id: 's1' });
  });

  describe('GET /api/products', () => {
    it('should return products', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([{ id: 'p1', name: 'Product 1' }]);
      (prisma.product.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/products', () => {
    it('should create a product', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({
        id: 'cat1',
        name: 'Electronics',
      });
      (prisma.product.create as jest.Mock).mockResolvedValue({ id: 'p1', name: 'New Product' });
      (prisma.idSequence.upsert as jest.Mock).mockResolvedValue({ seq: 1 });

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Product',
          price: 100,
          stock_quantity: 10,
          category_id: 'cat1',
          min_threshold: 5,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('New Product');
    });
  });
});
