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

// ─── POST /api/order (Permissions: Private) ──────────────────────────────────
export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  const result = await createOrderInDB(userId, req.body);

  // Invalidate dashboard metrics cache
  await redisClient.del('dashboard_metrics');

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Order created successfully.',
    data: result as any,
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

  const result = await updateOrderStatusInDB(userId, id as string, status);

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

  const result = await deleteOrderFromDB(userId, id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order deleted successfully.',
    data: result,
  });
});
