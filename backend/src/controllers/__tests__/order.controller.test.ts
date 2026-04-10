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

describe('OrderController', () => {
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
      body: {},
      params: {},
      query: {},
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

  describe('createOrder', () => {
    it('should return 201 and the created order on success', async () => {
      req.body = {
        customer_name: 'John Doe',
        items: [{ product_id: 'prod123', quantity: 1 }],
      };

      const mockOrder = { _id: 'order123', customer_name: 'John Doe' };
      (orderService.createOrderInDB as jest.Mock).mockResolvedValue({
        order: mockOrder,
        lowStockProducts: [],
      });

      await createOrder(req as Request, res as Response, next);

      expect(orderService.createOrderInDB).toHaveBeenCalledWith(req, 'user123', req.body);
      expect(redisClient.del).toHaveBeenCalledWith('dashboard_metrics');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Order created successfully.',
          data: mockOrder,
        }),
      );
      // Verify real-time emission
      expect(mockIo.emit).toHaveBeenCalledWith('order_created', mockOrder);
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

  describe('getOrders', () => {
    it('should return 200 and list of orders', async () => {
      const mockData = { meta: { total: 1 }, result: [{ _id: 'o1' }] };
      (orderService.getAllOrdersFromDB as jest.Mock).mockResolvedValue(mockData);

      await getOrders(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: mockData.result }));
    });
  });

  describe('getOrderById', () => {
    it('should return 200 and order details', async () => {
      req.params = { id: 'o1' };
      const mockData = { order: { _id: 'o1' }, items: [] };
      (orderService.getOrderByIdFromDB as jest.Mock).mockResolvedValue(mockData);

      await getOrderById(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: mockData }));
    });

    it('should call next(error) if service fails', async () => {
      req.params = { id: 'o1' };
      const error = new Error('Not found');
      (orderService.getOrderByIdFromDB as jest.Mock).mockRejectedValue(error);

      await getOrderById(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateOrderStatus', () => {
    it('should return 200 and updated order', async () => {
      req.params = { id: 'o1' };
      req.body = { status: 'Confirmed' };
      req.user = { _id: 'u1' } as any;

      const mockOrder = { _id: 'o1', status: 'Confirmed' };
      (orderService.updateOrderStatusInDB as jest.Mock).mockResolvedValue(mockOrder);

      await updateOrderStatus(req as Request, res as Response, next);

      expect(orderService.updateOrderStatusInDB).toHaveBeenCalledWith(req, 'u1', 'o1', 'Confirmed');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: mockOrder }));
      // Verify real-time emission
      expect(mockIo.emit).toHaveBeenCalledWith('order_updated', mockOrder);
    });
  });

  describe('deleteOrder', () => {
    it('should return 200 on successful deletion', async () => {
      req.params = { id: 'o1' };
      req.user = { _id: 'u1' } as any;

      const mockOrder = { _id: 'o1', is_deleted: true };
      (orderService.deleteOrderFromDB as jest.Mock).mockResolvedValue(mockOrder);

      await deleteOrder(req as Request, res as Response, next);

      expect(orderService.deleteOrderFromDB).toHaveBeenCalledWith(req, 'u1', 'o1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Order deleted successfully.' }),
      );
      // Verify real-time emission
      expect(mockIo.emit).toHaveBeenCalledWith('order_deleted', 'o1');
    });
  });
});
