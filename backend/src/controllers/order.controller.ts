import { Response } from 'express';
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
import { AuthenticatedRequest } from '../types';

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
}

// ─── POST /api/order (Permissions: Private) ──────────────────────────────────
export const createOrder = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id as string;
  const { order, lowStockProducts } = await createOrderInDB(req, userId, req.body);

  // Invalidate dashboard metrics cache
  await redisClient.del('dashboard_metrics');

  const io = req.app.get('io');

  //  Real-time order update
  if (io) {
    io.emit('order_created', order);
  }

  //  Low stock alerts
  if (lowStockProducts && (lowStockProducts as LowStockProduct[]).length > 0 && io) {
    logger.info(
      `📡 Found ${(lowStockProducts as LowStockProduct[]).length} low stock products. Emitting alerts...`,
    );
    (lowStockProducts as LowStockProduct[]).forEach((product) => {
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
    data: order,
  });
});

// ─── GET /api/order (Permissions: Private) ───────────────────────────────────
export const getOrders = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { meta, result } = await getAllOrdersFromDB(req.query as Record<string, unknown>);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Orders fetched successfully.',
    meta: meta,
    data: result,
  });
});

// ─── GET /api/order/:id (Permissions: Private) ───────────────────────────────
export const getOrderById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
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
export const updateOrderStatus = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id as string;
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
export const deleteOrder = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id as string;
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
