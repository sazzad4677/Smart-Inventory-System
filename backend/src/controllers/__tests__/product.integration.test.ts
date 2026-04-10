import request from 'supertest';
import { app } from '../../__tests__/integration.setup';
import Product from '../../models/product.model';
import Category from '../../models/category.model';
import { UserRole } from '../../types';

const MOCK_USER_ID = '507f1f77bcf86cd799439011';

// Mock the authentication middleware to bypass JWT/Session requirements
jest.mock('../../middlewares/auth.middleware', () => ({
  protect: (req: any, res: any, next: any) => {
    // Mock user object as expected by controllers
    req.user = { _id: MOCK_USER_ID, role: UserRole.Admin };
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

  describe('GET /api/products', () => {
    it('should only return non-deleted products', async () => {
      await Product.create([
        {
          product_id: 'TEST-P1',
          name: 'P1',
          category_id: categoryId,
          price: 10,
          stock_quantity: 5,
          min_threshold: 2,
          is_deleted: false,
          created_by: MOCK_USER_ID as any,
        },
        {
          product_id: 'TEST-P2',
          name: 'P2',
          category_id: categoryId,
          price: 20,
          stock_quantity: 5,
          min_threshold: 2,
          is_deleted: true,
          created_by: MOCK_USER_ID as any,
        },
      ]);

      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('P1');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update product details', async () => {
      const product = await Product.create({
        product_id: 'TEST-OLD',
        name: 'Old Name',
        category_id: categoryId,
        price: 10,
        stock_quantity: 5,
        min_threshold: 2,
        created_by: MOCK_USER_ID as any,
      });

      const res = await request(app).put(`/api/products/${product._id}`).send({ name: 'New Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('New Name');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should soft delete a product', async () => {
      const product = await Product.create({
        product_id: 'TEST-DEL',
        name: 'To Delete',
        category_id: categoryId,
        price: 10,
        stock_quantity: 5,
        min_threshold: 2,
        created_by: MOCK_USER_ID as any,
      });

      const res = await request(app).delete(`/api/products/${product._id}`);
      expect(res.status).toBe(200);

      const check = await Product.findById(product._id);
      expect(check?.is_deleted).toBe(true);
    });
  });

  describe('DELETE /api/products/bulk', () => {
    it('should bulk soft delete products', async () => {
      const p1 = await Product.create({
        product_id: 'TEST-B1',
        name: 'B1',
        category_id: categoryId,
        price: 10,
        stock_quantity: 5,
        min_threshold: 2,
        created_by: MOCK_USER_ID as any,
      });
      const p2 = await Product.create({
        product_id: 'TEST-B2',
        name: 'B2',
        category_id: categoryId,
        price: 10,
        stock_quantity: 5,
        min_threshold: 2,
        created_by: MOCK_USER_ID as any,
      });

      const res = await request(app)
        .delete('/api/products/bulk')
        .send({ ids: [p1._id, p2._id] });

      expect(res.status).toBe(200);

      const check = await Product.find({ _id: { $in: [p1._id, p2._id] } });
      expect(check.every((p) => p.is_deleted)).toBe(true);
    });
  });
});
