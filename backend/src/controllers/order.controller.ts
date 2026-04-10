import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import {
  createOrderInDB,
  getAllOrdersFromDB,
  getOrderByIdFromDB,
  updateOrderStatusInDB,
  deleteOrderFromDB,
} from '../services/order.service';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

// ─── POST /api/order (Permissions: Private) ──────────────────────────────────
export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  const { order, lowStockProducts } = await createOrderInDB(req, userId, req.body);

  // Invalidate dashboard metrics cache
  await redisClient.del('dashboard_metrics');

  const io = req.app.get('io');

  //  Real-time order update
  if (io) {
    io.emit('order_created', order);
  }

  //  Low stock alerts
  if (lowStockProducts && lowStockProducts.length > 0 && io) {
    logger.info(`📡 Found ${lowStockProducts.length} low stock products. Emitting alerts...`);
    lowStockProducts.forEach((product: any) => {
      logger.info(`🔔 Emitting low_stock_alert for: ${product.name} (Stock: ${product.stock})`);
      io.emit('low_stock_alert', {
        id: Math.random().toString(36).substring(2, 9),
        productName: product.name,
        currentStock: product.stock,
        message: `Critical: ${product.name} stock dropped to ${product.stock}`,
        timestamp: new Date(),
      });
    });
  }

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Order created successfully.',
    data: order as any,
  });
});

// ─── GET /api/order (Permissions: Private) ───────────────────────────────────
export const getOrders = catchAsync(async (req: Request, res: Response) => {
  const { meta, result } = await getAllOrdersFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Orders fetched successfully.',
    meta: meta,
    data: result,
  });
});

// ─── GET /api/order/:id (Permissions: Private) ───────────────────────────────
export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await getOrderByIdFromDB(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order fetched successfully.',
    data: result,
  });
});

// ─── PUT /api/order/:id/status (Permissions: Admin, Manager) ─────────────────
export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  const { id } = req.params;
  const { status } = req.body;

  const result = await updateOrderStatusInDB(req, userId, id as string, status);

  // Real-time update
  const io = req.app.get('io');
  if (io) {
    io.emit('order_updated', result);
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order status updated successfully.',
    data: result,
  });
});

// ─── DELETE /api/order/:id (Permissions: Admin Only) ──────────────────────────
export const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  const { id } = req.params;

  const result = await deleteOrderFromDB(req, userId, id as string);

  // Real-time deletion
  const io = req.app.get('io');
  if (io) {
    io.emit('order_deleted', id);
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order deleted successfully.',
    data: result,
  });
});
