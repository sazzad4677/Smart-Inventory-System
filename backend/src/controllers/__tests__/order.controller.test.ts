import { Request, Response, NextFunction } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from '../order.controller';
import * as orderService from '../../services/order.service';
import { redisClient } from '../../config/redis';

// Mock services and redis
jest.mock('../../services/order.service');
jest.mock('../../config/redis', () => ({
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

describe('OrderController - getOrders', () => {
  let req: any, res: any, next: any;
  beforeEach(() => {
    req = { query: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    next = jest.fn();
  });

  it('should return 200 and list of orders', async () => {
    const mockData = { meta: { total: 1 }, result: [{ _id: 'o1' }] };
    (orderService.getAllOrdersFromDB as jest.Mock).mockResolvedValue(mockData);

    await getOrders(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: mockData.result }));
  });
});

describe('OrderController - getOrderById', () => {
  let req: any, res: any, next: any;
  beforeEach(() => {
    req = { params: { id: 'o1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    next = jest.fn();
  });

  it('should return 200 and order details', async () => {
    const mockData = { order: { _id: 'o1' }, items: [] };
    (orderService.getOrderByIdFromDB as jest.Mock).mockResolvedValue(mockData);

    await getOrderById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: mockData }));
  });

  it('should call next(error) if service fails', async () => {
    const error = new Error('Not found');
    (orderService.getOrderByIdFromDB as jest.Mock).mockRejectedValue(error);
    await getOrderById(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('OrderController - updateOrderStatus', () => {
  let req: any, res: any, next: any;
  beforeEach(() => {
    req = { params: { id: 'o1' }, body: { status: 'Confirmed' }, user: { _id: 'u1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    next = jest.fn();
  });

  it('should return 200 and updated order', async () => {
    const mockOrder = { _id: 'o1', status: 'Confirmed' };
    (orderService.updateOrderStatusInDB as jest.Mock).mockResolvedValue(mockOrder);

    await updateOrderStatus(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: mockOrder }));
  });
});

describe('OrderController - deleteOrder', () => {
  let req: any, res: any, next: any;
  beforeEach(() => {
    req = { params: { id: 'o1' }, user: { _id: 'u1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    next = jest.fn();
  });

  it('should return 200 on successful deletion', async () => {
    const mockOrder = { _id: 'o1', is_deleted: true };
    (orderService.deleteOrderFromDB as jest.Mock).mockResolvedValue(mockOrder);

    await deleteOrder(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Order deleted successfully.' }),
    );
  });
});
