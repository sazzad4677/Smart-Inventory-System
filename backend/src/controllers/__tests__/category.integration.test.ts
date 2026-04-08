import request from 'supertest';
import { app } from '../../__tests__/integration.setup';
import Category from '../../models/category.model';

// Mock the authentication middleware to bypass JWT/Session requirements
jest.mock('../../middlewares/auth.middleware', () => ({
  protect: (req: any, res: any, next: any) => {
    // Mock user object as expected by controllers
    req.user = { _id: '507f1f77bcf86cd799439011' };
    next();
  },
  restrictTo: () => (req: any, res: any, next: any) => next(),
}));

describe('Category Integration Tests', () => {
  describe('POST /api/categories', () => {
    it('should successfully create a new category and return 201', async () => {
      const payload = { name: 'Test Category' };

      const res = await request(app).post('/api/categories').send(payload);

      // Verify response
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(payload.name);

      // Verify it actually saved to the in-memory database
      const savedCategory = await Category.findOne({ name: payload.name });
      expect(savedCategory).toBeTruthy();
      expect(savedCategory?.name).toBe(payload.name);
    });

    it('should return 400 if validation fails (empty payload)', async () => {
      const res = await request(app).post('/api/categories').send({});

      // Verify failure response
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
