import request from 'supertest';
import { app } from '../../__tests__/integration.setup';
import Product from '../../models/product.model';
import Category from '../../models/category.model';
import { UserRole } from '../../types';

// Mock the authentication middleware to bypass JWT/Session requirements
jest.mock('../../middlewares/auth.middleware', () => ({
  protect: (req: any, res: any, next: any) => {
    // Mock user object as expected by controllers
    req.user = { _id: '507f1f77bcf86cd799439011', role: UserRole.Admin };
    next();
  },
  restrictTo:
    (...roles: string[]) =>
    (req: any, res: any, next: any) => {
      // Check if the mocked user has the required role
      if (roles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({ success: false, message: 'Forbidden' });
      }
    },
}));

describe('Product Integration Tests', () => {
  let categoryId: string;

  beforeEach(async () => {
    // Seed an existing category to link products to
    const category = await Category.create({ name: 'Electronics' });
    categoryId = (category._id as any).toString();
  });

  describe('POST /api/products', () => {
    it('should successfully create a new product and return 201', async () => {
      const payload = {
        name: 'Smartphone X',
        category_id: categoryId,
        price: 999,
        stock_quantity: 50,
        min_threshold: 10,
      };

      const res = await request(app).post('/api/products').send(payload);

      // Verify response
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(payload.name);
      expect(res.body.data.category_id).toBe(categoryId);

      // Verify it actually saved to the in-memory database
      const savedProduct = await Product.findOne({ name: payload.name });
      expect(savedProduct).toBeTruthy();
      expect(savedProduct?.price).toBe(payload.price);
    });

    it('should return 400 if validation fails (e.g., missing price)', async () => {
      const payload = {
        name: 'Incomplete Product',
        category_id: categoryId,
        stock_quantity: 50,
        min_threshold: 10,
        // Missing price
      };

      const res = await request(app).post('/api/products').send(payload);

      // Verify failure response
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if the category ID provided is completely invalid', async () => {
      const payload = {
        name: 'Invalid Category Product',
        category_id: 'invalid-id', // Not a valid MongoDB ObjectId
        price: 500,
        stock_quantity: 20,
        min_threshold: 5,
      };

      const res = await request(app).post('/api/products').send(payload);

      // Zod validation should catch this or Mongoose will throw a CastError
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 or 404 if the category ID looks valid but does not exist', async () => {
      const nonExistentId = '507f1f77bcf86cd799439012'; // Valid format but no such document
      const payload = {
        name: 'Non-existent Category Product',
        category_id: nonExistentId,
        price: 500,
        stock_quantity: 20,
        min_threshold: 5,
      };

      const res = await request(app).post('/api/products').send(payload);

      // Based on controller implementation, this should return a 400/404 because the category isn't found
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
