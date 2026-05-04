import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from '../order.controller';
import * as orderService from '../../services/order.service';
import { Request, Response } from 'express';

// Mock dependencies
jest.mock('../../services/order.service');
jest.mock('../../config/redis', () => ({
  redisClient: {
    del: jest.fn().mockResolvedValue(true),
  },
}));

describe('Order Controller', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 'user123', role: 'Admin' },
      app: {
        get: jest.fn().mockReturnValue({ emit: jest.fn() }),
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('createOrder', () => {
    it('should call orderService.createOrderInDB and return 201', async () => {
      const mockResult = { order: { id: 'o1' }, lowStockProducts: [] };
      (orderService.createOrderInDB as jest.Mock).mockResolvedValue(mockResult);

      req.body = { customer_name: 'John' };
      await createOrder(req as Request, res as Response, next);

      if (next.mock.calls.length > 0) {
        console.error('Next called with error:', next.mock.calls[0][0]);
      }

      expect(orderService.createOrderInDB).toHaveBeenCalledWith(req, 'user123', req.body);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getOrders', () => {
    it('should return 200 and all orders', async () => {
      const mockResult = { result: [{ id: 'o1' }], meta: {} };
      (orderService.getAllOrdersFromDB as jest.Mock).mockResolvedValue(mockResult);

      await getOrders(req as Request, res as Response, next);

      expect(orderService.getAllOrdersFromDB).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getOrderById', () => {
    it('should return 200 and the order', async () => {
      req.params = { id: 'o1' };
      (orderService.getOrderByIdFromDB as jest.Mock).mockResolvedValue({ id: 'o1' });

      await getOrderById(req as Request, res as Response, next);

      expect(orderService.getOrderByIdFromDB).toHaveBeenCalledWith('o1');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update status and return 200', async () => {
      req.params = { id: 'o1' };
      req.body = { status: 'Delivered' };
      (orderService.updateOrderStatusInDB as jest.Mock).mockResolvedValue({
        id: 'o1',
        status: 'Delivered',
      });

      await updateOrderStatus(req as Request, res as Response, next);

      expect(orderService.updateOrderStatusInDB).toHaveBeenCalledWith(
        req,
        'user123',
        'o1',
        'Delivered',
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteOrder', () => {
    it('should delete order and return 200', async () => {
      req.params = { id: 'o1' };
      (orderService.deleteOrderFromDB as jest.Mock).mockResolvedValue({});

      await deleteOrder(req as Request, res as Response, next);

      expect(orderService.deleteOrderFromDB).toHaveBeenCalledWith(req, 'user123', 'o1');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
