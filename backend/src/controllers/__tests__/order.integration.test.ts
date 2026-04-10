import request from 'supertest';
import { app } from '../../__tests__/integration.setup';
import Order from '../../models/order.model';
import OrderItem from '../../models/order-item.model';
import Product from '../../models/product.model';
import Category from '../../models/category.model';
import User from '../../models/user.model';
import { UserRole, ProductStatus } from '../../types';
import { logger } from '../../utils/logger';

describe('Order API Integration', () => {
  let authToken: string;
  let productId: string;
  let categoryId: string;

  const testUser = {
    email: 'order-tester@example.com',
    password: 'Password123!',
    role: UserRole.Admin,
  };

  beforeEach(async () => {
    // 1. Create a dummy test User via signup API
    await request(app).post('/api/auth/signup').send(testUser);

    // 2. Login to get accessToken
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    authToken = loginRes.body.data.accessToken;

    // Get user id from DB
    const user = await User.findOne({ email: testUser.email });
    const userId = user!._id;

    // 3. Create a dummy Category
    const category = await Category.create({ name: 'Furniture' });
    categoryId = (category._id as any).toString();

    // 4. Create a dummy Product linked to that Category
    const product = await Product.create({
      name: 'Office Chair',
      category_id: categoryId,
      price: 150,
      stock_quantity: 10,
      min_threshold: 2,
      status: ProductStatus.Active,
      created_by: userId as any,
    });
    productId = (product._id as any).toString();
  });

  describe('POST /api/orders', () => {
    it('should successfully create an order and return 201', async () => {
      const payload = {
        customer_name: 'John Doe',
        items: [
          {
            product_id: productId,
            quantity: 2,
          },
        ],
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      if (res.status !== 201) {
        logger.info('DEBUG RES BODY:', JSON.stringify(res.body, null, 2));
      }

      // Verify response
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customer_name).toBe('John Doe');

      // Verify the order saved in the DB
      const order = await Order.findOne({ customer_name: 'John Doe' });
      expect(order).toBeTruthy();
      if (!order) throw new Error('Order not found');
      expect(order.total_price).toBe(300); // 150 * 2

      // Verify order items
      // Verify order items
      const orderItems = await OrderItem.find({ order_id: order._id as any });
      expect(orderItems).toHaveLength(1);

      const firstItem = orderItems[0];
      expect(firstItem).toBeDefined();
      expect(firstItem!.quantity).toBe(2);
      expect(firstItem!.product_id.toString()).toBe(productId);

      // Verify stock reduction in DB
      const updatedProduct = await Product.findById(productId);
      expect(updatedProduct?.stock_quantity).toBe(8); // 10 - 2
    });

    it('should return 401 Unauthorized if no token is provided', async () => {
      const payload = {
        customer_name: 'John Doe',
        items: [
          {
            product_id: productId,
            quantity: 2,
          },
        ],
      };

      const res = await request(app).post('/api/orders').send(payload);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return an error if the requested quantity exceeds available stock', async () => {
      const payload = {
        customer_name: 'John Doe',
        items: [
          {
            product_id: productId,
            quantity: 50, // exceeds stock of 10
          },
        ],
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      // Should return 400 Bad Request
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/available/i);
    });
  });
});
