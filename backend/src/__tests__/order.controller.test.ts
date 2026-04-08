import { Request, Response, NextFunction } from 'express';
import { createOrder } from '../controllers/order.controller';
import * as orderService from '../services/order.service';
import { redisClient } from '../config/redis';

// Mock services and redis
jest.mock('../services/order.service');
jest.mock('../config/redis', () => ({
  redisClient: {
    del: jest.fn().mockResolvedValue(true),
  },
}));

describe('OrderController - createOrder', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let mockIo: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockIo = {
      emit: jest.fn(),
    };

    req = {
      body: {
        customer_name: 'John Doe',
        items: [{ product_id: 'prod123', quantity: 1 }],
      },
      app: {
        get: jest.fn().mockReturnValue(mockIo),
      } as any,
      user: { _id: 'user123' } as any,
    } as any;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  it('should return 201 and the created order on success', async () => {
    const mockOrder = { _id: 'order123', customer_name: 'John Doe' };
    (orderService.createOrderInDB as jest.Mock).mockResolvedValue({
      order: mockOrder,
      lowStockProducts: [],
    });

    await createOrder(req as Request, res as Response, next);

    expect(orderService.createOrderInDB).toHaveBeenCalledWith('user123', req.body);
    expect(redisClient.del).toHaveBeenCalledWith('dashboard_metrics');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Order created successfully.',
        data: mockOrder,
      }),
    );
  });

  it('should call next(error) if the service throws an error', async () => {
    const error = new Error('Service Error');
    (orderService.createOrderInDB as jest.Mock).mockRejectedValue(error);

    await createOrder(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should emit low stock alerts if products are below threshold', async () => {
    const mockOrder = { _id: 'order123' };
    const lowStockProducts = [{ name: 'Product A', stock: 2 }];
    (orderService.createOrderInDB as jest.Mock).mockResolvedValue({
      order: mockOrder,
      lowStockProducts,
    });

    await createOrder(req as Request, res as Response, next);

    expect(mockIo.emit).toHaveBeenCalledWith(
      'low_stock_alert',
      expect.objectContaining({
        productName: 'Product A',
        currentStock: 2,
      }),
    );
  });
});
