import prisma from '../../config/prisma';
import {
  createOrderInDB,
  getAllOrdersFromDB,
  getOrderByIdFromDB,
  updateOrderStatusInDB,
  deleteOrderFromDB,
} from '../order.service';
import * as idUtils from '../../utils/id.utils';
import { ProductStatus, OrderStatus } from '../../types';
import { AppError } from '../../utils/AppError';

// Mock dependencies
jest.mock('../../config/prisma', () => ({
  __esModule: true,
  default: {
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    activityLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

jest.mock('../../utils/id.utils');
jest.mock('../../utils/activity-logger');

describe('OrderService - createOrderInDB', () => {
  let req: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      ip: '127.0.0.1',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn().mockReturnValue('mock-agent'),
    };

    // Mock generateNextId
    (idUtils.generateNextId as jest.Mock).mockResolvedValue('ORD-123456');
  });

  it('should successfully create an order and deduct product stock', async () => {
    const userId = 'user-123';
    const payload = {
      customer_name: 'John Doe',
      items: [{ product_id: 'prod123', quantity: 2 }],
    };

    const mockProduct = {
      id: 'prod123',
      name: 'Test Product',
      price: 100,
      stock_quantity: 10,
      min_threshold: 1,
      status: ProductStatus.Active,
    };

    (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
    (prisma.product.update as jest.Mock).mockResolvedValue({ ...mockProduct, stock_quantity: 8 });

    const mockOrder = {
      id: 'order123',
      customer_name: 'John Doe',
      order_id: 'ORD-123456',
      total_price: 200,
      status: OrderStatus.Pending,
      orderItems: [],
    };

    (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);

    const result = await createOrderInDB(req as any, userId, payload);

    expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 'prod123' } });
    expect(prisma.product.update).toHaveBeenCalled();
    expect(prisma.order.create).toHaveBeenCalled();
    expect(result.order).toEqual(mockOrder);
  });

  it('should throw an error if the product is not found', async () => {
    const userId = 'user-123';
    const payload = {
      customer_name: 'John Doe',
      items: [{ product_id: 'nonexistent', quantity: 1 }],
    };

    (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(createOrderInDB(req as any, userId, payload)).rejects.toThrow(
      new AppError('Product with ID nonexistent not found', 404),
    );
  });

  it('should throw an error if requested quantity exceeds available stock', async () => {
    const userId = 'user-123';
    const payload = {
      customer_name: 'John Doe',
      items: [{ product_id: 'prod123', quantity: 20 }],
    };

    const mockProduct = {
      id: 'prod123',
      name: 'Test Product',
      stock_quantity: 10,
      status: ProductStatus.Active,
    };

    (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

    await expect(createOrderInDB(req as any, userId, payload)).rejects.toThrow(
      new AppError('Only 10 items available for "Test Product"', 400),
    );
  });

  it('should throw an error if duplicate products are found in the order', async () => {
    const userId = 'user-123';
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
});

describe('OrderService - getAllOrdersFromDB', () => {
  it('should return results and meta', async () => {
    const mockOrders = [{ id: 'order1' }];
    const mockTotal = 1;

    (prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders);
    (prisma.order.count as jest.Mock).mockResolvedValue(mockTotal);

    const result = await getAllOrdersFromDB({ page: 1, limit: 10 });

    expect(prisma.order.findMany).toHaveBeenCalled();
    expect(prisma.order.count).toHaveBeenCalled();
    expect(result.result).toEqual(mockOrders);
    expect(result.meta.total).toBe(mockTotal);
  });
});

describe('OrderService - getOrderByIdFromDB', () => {
  it('should return order and items if found', async () => {
    const orderId = 'order123';
    const mockOrder = {
      id: orderId,
      customer_name: 'John',
      orderItems: [{ product: { name: 'P1' } }],
    };

    (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

    const result = await getOrderByIdFromDB(orderId);
    expect(result.order).toEqual(mockOrder);
    expect(result.items).toEqual(mockOrder.orderItems);
  });

  it('should throw 404 if order not found', async () => {
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(getOrderByIdFromDB('invalid')).rejects.toThrow(
      new AppError('Order not found', 404),
    );
  });
});

describe('OrderService - updateOrderStatusInDB', () => {
  const userId = 'user-123';

  it('should update status and log activity', async () => {
    const req = {
      ip: '127.0.0.1',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn().mockReturnValue('mock-agent'),
    };
    const mockOrder = {
      id: 'order123',
      order_id: 'ORD-1',
      status: OrderStatus.Pending,
      orderItems: [],
    };
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.order.update as jest.Mock).mockResolvedValue({
      ...mockOrder,
      status: OrderStatus.Confirmed,
    });

    const result = await updateOrderStatusInDB(
      req as any,
      userId,
      'order123',
      OrderStatus.Confirmed,
    );
    expect(result.status).toBe(OrderStatus.Confirmed);
    expect(prisma.order.update).toHaveBeenCalled();
  });

  it('should restore stock if order is cancelled', async () => {
    const mockOrder = {
      id: 'order123',
      status: OrderStatus.Pending,
      orderItems: [{ product_id: 'p1', quantity: 5 }],
    };
    const mockProduct = {
      id: 'p1',
      stock_quantity: 10,
      min_threshold: 5,
    };

    (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
    (prisma.order.update as jest.Mock).mockResolvedValue({
      ...mockOrder,
      status: OrderStatus.Cancelled,
    });

    const req = {
      ip: '127.0.0.1',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn().mockReturnValue('mock-agent'),
    };
    await updateOrderStatusInDB(req as any, userId, 'order123', OrderStatus.Cancelled);

    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stock_quantity: 15 }),
      }),
    );
  });
});

describe('OrderService - deleteOrderFromDB', () => {
  it('should mark order as deleted', async () => {
    const userId = 'user-123';
    const mockOrder = { id: 'order123', order_id: 'ORD-1', is_deleted: true };

    (prisma.order.update as jest.Mock).mockResolvedValue(mockOrder);

    const req = {
      ip: '127.0.0.1',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn().mockReturnValue('mock-agent'),
    };
    const result = await deleteOrderFromDB(req as any, userId, 'order123');
    expect(result.is_deleted).toBe(true);
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: 'order123' },
      data: { is_deleted: true },
    });
  });

  it('should throw 404 if order to delete not found', async () => {
    (prisma.order.update as jest.Mock).mockResolvedValue(null);
    await expect(deleteOrderFromDB({} as any, 'u1', 'inv')).rejects.toThrow(
      new AppError('Order not found', 404),
    );
  });
});

describe('OrderService - Additional Branches', () => {
  it('should filter orders by searchTerm', async () => {
    (prisma.order.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.order.count as jest.Mock).mockResolvedValue(0);
    await getAllOrdersFromDB({ searchTerm: 'test' });
    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ OR: expect.any(Array) }),
      }),
    );
  });

  it('should throw error if product is not active during creation', async () => {
    (prisma.product.findUnique as jest.Mock).mockResolvedValue({
      id: 'p1',
      name: 'P',
      status: ProductStatus.OutOfStock,
      stock_quantity: 10,
    });
    await expect(
      createOrderInDB({} as any, 'u1', { items: [{ product_id: 'p1', quantity: 1 }] } as any),
    ).rejects.toThrow(/is not Active/);
  });

  it('should throw 404 if order to update not found', async () => {
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(
      updateOrderStatusInDB({} as any, 'u1', 'inv', OrderStatus.Confirmed),
    ).rejects.toThrow(new AppError('Order not found', 404));
  });

  it('should throw error if trying to update an already cancelled order', async () => {
    (prisma.order.findUnique as jest.Mock).mockResolvedValue({ status: OrderStatus.Cancelled });
    await expect(
      updateOrderStatusInDB({} as any, 'u1', 'o1', OrderStatus.Confirmed),
    ).rejects.toThrow(new AppError('Order is already cancelled.', 400));
  });
});
