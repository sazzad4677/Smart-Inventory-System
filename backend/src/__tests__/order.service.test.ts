import mongoose from 'mongoose';
import { createOrderInDB } from '../services/order.service';
import Product from '../models/product.model';
import Order from '../models/order.model';
import OrderItem from '../models/order-item.model';
import ActivityLog from '../models/activity-log.model';
import * as idUtils from '../utils/id.utils';
import { ProductStatus, OrderStatus } from '../types';
import { AppError } from '../utils/AppError';

// Mock models and utils
jest.mock('../models/product.model');
jest.mock('../models/order.model');
jest.mock('../models/order-item.model');
jest.mock('../models/activity-log.model');
jest.mock('../utils/id.utils');

describe('OrderService - createOrderInDB', () => {
  let session: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock session
    session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    // Correctly mock mongoose.startSession
    (mongoose.startSession as jest.Mock) = jest.fn().mockResolvedValue(session);

    // Mock generateNextId
    (idUtils.generateNextId as jest.Mock).mockResolvedValue('ORD-123456');
  });

  it('should successfully create an order and deduct product stock', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const payload = {
      customer_name: 'John Doe',
      items: [{ product_id: 'prod123', quantity: 2 }],
    };

    const mockProduct = {
      _id: 'prod123',
      name: 'Test Product',
      price: 100,
      stock_quantity: 10,
      min_threshold: 1,
      status: ProductStatus.Active,
      save: jest.fn().mockResolvedValue(true),
    };

    // Chain session() to findById
    (Product.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(mockProduct),
    });

    const mockOrder = {
      _id: 'order123',
      customer_name: 'John Doe',
      order_id: 'ORD-123456',
      total_price: 200,
      status: OrderStatus.Pending,
    };

    // Order.create with array returns array
    (Order.create as jest.Mock).mockResolvedValue([mockOrder]);
    (OrderItem.create as jest.Mock).mockResolvedValue(true);
    (ActivityLog.create as jest.Mock).mockResolvedValue(true);

    const result = await createOrderInDB(userId, payload);

    expect(Product.findById).toHaveBeenCalledWith('prod123');
    expect(mockProduct.stock_quantity).toBe(8); // 10 - 2
    expect(mockProduct.save).toHaveBeenCalledWith({ session });
    expect(Order.create).toHaveBeenCalled();
    expect(session.commitTransaction).toHaveBeenCalled();
    expect(result.order).toEqual(mockOrder);
  });

  it('should throw an error if the product is not found', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const payload = {
      customer_name: 'John Doe',
      items: [{ product_id: 'nonexistent', quantity: 1 }],
    };

    (Product.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(null),
    });

    await expect(createOrderInDB(userId, payload)).rejects.toThrow(
      new AppError('Product with ID nonexistent not found', 404),
    );

    expect(session.abortTransaction).toHaveBeenCalled();
  });

  it('should throw an error if requested quantity exceeds available stock', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const payload = {
      customer_name: 'John Doe',
      items: [{ product_id: 'prod123', quantity: 20 }],
    };

    const mockProduct = {
      _id: 'prod123',
      name: 'Test Product',
      stock_quantity: 10,
      status: ProductStatus.Active,
    };

    (Product.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(mockProduct),
    });

    await expect(createOrderInDB(userId, payload)).rejects.toThrow(
      new AppError('Only 10 items available for "Test Product"', 400),
    );

    expect(session.abortTransaction).toHaveBeenCalled();
  });
});
