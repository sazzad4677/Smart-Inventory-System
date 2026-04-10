import mongoose from 'mongoose';
import {
  createOrderInDB,
  getAllOrdersFromDB,
  getOrderByIdFromDB,
  updateOrderStatusInDB,
  deleteOrderFromDB,
} from '../order.service';
import Product from '../../models/product.model';
import Order from '../../models/order.model';
import OrderItem from '../../models/order-item.model';
import ActivityLog from '../../models/activity-log.model';
import * as idUtils from '../../utils/id.utils';
import { ProductStatus, OrderStatus } from '../../types';
import { AppError } from '../../utils/AppError';
import QueryBuilder from '../../builders/QueryBuilder';

// Mock models and utils
jest.mock('../../models/product.model');
jest.mock('../../models/order.model');
jest.mock('../../models/order-item.model');
jest.mock('../../models/activity-log.model');
jest.mock('../../utils/id.utils');
jest.mock('../../builders/QueryBuilder');

describe('OrderService - createOrderInDB', () => {
  let session: any;
  let req: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      ip: '127.0.0.1',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn().mockReturnValue('mock-agent'),
    };

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

    const result = await createOrderInDB(req as any, userId, payload);

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

    await expect(createOrderInDB(req as any, userId, payload)).rejects.toThrow(
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

    await expect(createOrderInDB(req as any, userId, payload)).rejects.toThrow(
      new AppError('Only 10 items available for "Test Product"', 400),
    );

    expect(session.abortTransaction).toHaveBeenCalled();
  });

  it('should throw an error if duplicate products are found in the order', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const payload = {
      customer_name: 'John',
      items: [
        { product_id: 'p1', quantity: 1 },
        { product_id: 'p1', quantity: 2 },
      ],
    };

    await expect(createOrderInDB(req as any, userId, payload)).rejects.toThrow(
      new AppError('Duplicate products found in the order.', 400),
    );
  });

  it('should throw an error if the product status is not Active', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const payload = {
      customer_name: 'John',
      items: [{ product_id: 'p1', quantity: 1 }],
    };
    const mockProduct = {
      _id: 'p1',
      name: 'P1',
      status: ProductStatus.OutOfStock,
    };
    (Product.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(mockProduct),
    });

    await expect(createOrderInDB(req as any, userId, payload)).rejects.toThrow(
      expect.objectContaining({ statusCode: 400 }),
    );
  });

  it('should flag for restock if stock hits threshold', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const payload = { customer_name: 'John', items: [{ product_id: 'p1', quantity: 5 }] };
    const mockProduct = {
      _id: 'p1',
      name: 'P1',
      price: 10,
      stock_quantity: 10,
      min_threshold: 6,
      status: ProductStatus.Active,
      is_restock_required: false,
      save: jest.fn().mockResolvedValue(true),
    };

    (Product.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(mockProduct),
    });
    (Order.create as jest.Mock).mockResolvedValue([{ _id: 'o1' }]);
    (OrderItem.create as jest.Mock).mockResolvedValue(true);
    (ActivityLog.create as jest.Mock).mockResolvedValue(true);

    const result = await createOrderInDB(req as any, userId, payload);
    expect(mockProduct.is_restock_required).toBe(true);
    expect(result.lowStockProducts).toHaveLength(1);
  });
});

describe('OrderService - getAllOrdersFromDB', () => {
  it('should return results and meta from QueryBuilder', async () => {
    const mockResult = [{ _id: 'order1' }];
    const mockMeta = { total: 1 };
    const mockQueryBuilder = {
      search: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      paginate: jest.fn().mockReturnThis(),
      fields: jest.fn().mockReturnThis(),
      modelQuery: Promise.resolve(mockResult),
      countTotal: jest.fn().mockResolvedValue(mockMeta),
    };
    (QueryBuilder as jest.Mock).mockImplementation(() => mockQueryBuilder);

    const result = await getAllOrdersFromDB({});
    expect(result.result).toEqual(mockResult);
    expect(result.meta).toEqual(mockMeta);
  });
});

describe('OrderService - getOrderByIdFromDB', () => {
  it('should return order and items if found', async () => {
    const orderId = 'order123';
    const mockOrder = { _id: orderId, customer_name: 'John' };
    const mockItems = [{ product_id: 'p1', quantity: 1 }];

    (Order.findById as jest.Mock).mockResolvedValue(mockOrder);
    (OrderItem.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockItems),
    });

    const result = await getOrderByIdFromDB(orderId);
    expect(result.order).toEqual(mockOrder);
    expect(result.items).toEqual(mockItems);
  });

  it('should throw 404 if order not found', async () => {
    (Order.findById as jest.Mock).mockResolvedValue(null);
    await expect(getOrderByIdFromDB('invalid')).rejects.toThrow(
      new AppError('Order not found', 404),
    );
  });
});

describe('OrderService - updateOrderStatusInDB', () => {
  let session: any;
  const userId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    (mongoose.startSession as jest.Mock).mockResolvedValue(session);
  });

  it('should update status and log activity', async () => {
    const req = {
      ip: '127.0.0.1',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn().mockReturnValue('mock-agent'),
    };
    const mockOrder = {
      _id: 'order123',
      status: OrderStatus.Pending,
      save: jest.fn().mockResolvedValue(true),
    };
    (Order.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(mockOrder),
    });
    (ActivityLog.create as jest.Mock).mockResolvedValue(true);

    const result = await updateOrderStatusInDB(
      req as any,
      userId,
      'order123',
      OrderStatus.Confirmed,
    );
    expect(mockOrder.status).toBe(OrderStatus.Confirmed);
    expect(session.commitTransaction).toHaveBeenCalled();
    expect(result).toEqual(mockOrder);
  });

  it('should restore stock if order is cancelled', async () => {
    const mockOrder = {
      _id: 'order123',
      status: OrderStatus.Pending,
      save: jest.fn().mockResolvedValue(true),
    };
    const mockItems = [{ product_id: 'p1', quantity: 5 }];
    const mockProduct = {
      _id: 'p1',
      stock_quantity: 10,
      min_threshold: 5,
      save: jest.fn().mockResolvedValue(true),
    };

    (Order.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(mockOrder),
    });
    (OrderItem.find as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(mockItems),
    });
    (Product.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(mockProduct),
    });

    const req = {
      ip: '127.0.0.1',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn().mockReturnValue('mock-agent'),
    };
    await updateOrderStatusInDB(req as any, userId, 'order123', OrderStatus.Cancelled);

    expect(mockProduct.stock_quantity).toBe(15);
    expect(mockProduct.save).toHaveBeenCalled();
    expect(mockOrder.status).toBe(OrderStatus.Cancelled);
  });

  it('should throw 404 if order not found for status update', async () => {
    (Order.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(null),
    });
    const req = {
      ip: '127.0.0.1',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn().mockReturnValue('mock-agent'),
    };
    await expect(
      updateOrderStatusInDB(req as any, userId, 'invalid', OrderStatus.Confirmed),
    ).rejects.toThrow(new AppError('Order not found', 404));
  });

  it('should throw 400 if order is already cancelled', async () => {
    const mockOrder = { _id: 'o1', status: OrderStatus.Cancelled };
    (Order.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(mockOrder),
    });
    const req = {
      ip: '127.0.0.1',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn().mockReturnValue('mock-agent'),
    };
    await expect(
      updateOrderStatusInDB(req as any, userId, 'o1', OrderStatus.Confirmed),
    ).rejects.toThrow(new AppError('Order is already cancelled.', 400));
  });
});

describe('OrderService - deleteOrderFromDB', () => {
  let session: any;
  beforeEach(() => {
    session = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    (mongoose.startSession as jest.Mock).mockResolvedValue(session);
  });
  it('should mark order as deleted', async () => {
    const userId = new mongoose.Types.ObjectId();
    const mockOrder = { _id: 'order123', is_deleted: true };

    (Order.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockOrder);

    const req = {
      ip: '127.0.0.1',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn().mockReturnValue('mock-agent'),
    };
    const result = await deleteOrderFromDB(req as any, userId, 'order123');
    expect(result.is_deleted).toBe(true);
    expect(session.commitTransaction).toHaveBeenCalled();
  });

  it('should throw 404 if order not found for deletion', async () => {
    const userId = new mongoose.Types.ObjectId();
    (Order.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
    const req = {
      ip: '127.0.0.1',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn().mockReturnValue('mock-agent'),
    };
    await expect(deleteOrderFromDB(req as any, userId, 'invalid')).rejects.toThrow(
      new AppError('Order not found', 404),
    );
  });
});
