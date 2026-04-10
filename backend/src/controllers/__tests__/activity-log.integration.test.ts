import request from 'supertest';
import { app } from '../../__tests__/integration.setup';
import ActivityLog from '../../models/activity-log.model';
import Product from '../../models/product.model';
import Category from '../../models/category.model';
import { UserRole, ActivityType } from '../../types';

const MOCK_ADMIN_ID = '507f1f77bcf86cd799439011';
const MOCK_MANAGER_ID = '507f1f77bcf86cd799439012';

// Mock auth middleware for different roles
jest.mock('../../middlewares/auth.middleware', () => ({
  protect: (req: any, res: any, next: any) => {
    req.user = { _id: MOCK_ADMIN_ID, role: UserRole.Admin };
    next();
  },
  restrictTo:
    (...roles: string[]) =>
    (req: any, res: any, next: any) => {
      if (roles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({ success: false, message: 'Forbidden' });
      }
    },
}));

describe('Activity Log Integration Tests', () => {
  let categoryId: string;
  let productId: string;

  beforeEach(async () => {
    const category = await Category.create({ name: 'Test Category' });
    categoryId = (category._id as any).toString();

    const product = await Product.create({
      product_id: 'TEST-P1',
      name: 'Test Product',
      category_id: categoryId,
      price: 100,
      stock_quantity: 10,
      min_threshold: 2,
      is_deleted: false,
      created_by: MOCK_ADMIN_ID as any,
    });
    productId = (product._id as any).toString();
  });

  describe('POST /api/activity-logs/:id/undo', () => {
    it('should successfully restore a soft-deleted product', async () => {
      // 1. Soft delete the product
      await Product.findByIdAndUpdate(productId, { is_deleted: true });

      // 2. Create a mock activity log for the deletion
      const log = await ActivityLog.create({
        action_text: 'Product deleted: Test Product',
        type: ActivityType.Delete,
        resource: 'PRODUCT',
        resource_id: productId,
        user_id: MOCK_ADMIN_ID,
        timestamp: new Date(),
      });

      // 3. Call the undo endpoint
      const res = await request(app).post(`/api/activity-logs/${log._id}/undo`);

      // 4. Verify response and state
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('restored successfully');

      const updatedProduct = await Product.findById(productId);
      expect(updatedProduct?.is_deleted).toBe(false);
    });

    it('should return 400 for non-undoable actions', async () => {
      const log = await ActivityLog.create({
        action_text: 'User logged in',
        type: ActivityType.Login,
        user_id: MOCK_ADMIN_ID,
        timestamp: new Date(),
      });

      const res = await request(app).post(`/api/activity-logs/${log._id}/undo`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('This action cannot be undone.');
    });

    it('should return 404 for non-existent log', async () => {
      const fakeId = '507f1f77bcf86cd799439099';
      const res = await request(app).post(`/api/activity-logs/${fakeId}/undo`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Activity log not found');
    });
  });

  describe('GET /api/activity-logs', () => {
    it('should fetch paginated activity logs', async () => {
      await ActivityLog.create({
        action_text: 'Action 1',
        type: ActivityType.Create,
        user_id: MOCK_ADMIN_ID,
        timestamp: new Date(),
      });

      const res = await request(app).get('/api/activity-logs');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
    });
  });
});
