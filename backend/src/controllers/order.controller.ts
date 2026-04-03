import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import {
  createOrderInDB,
  getAllOrdersFromDB,
  updateOrderStatusInDB,
} from '../services/order.service';

// ─── POST /api/orders ───────────────────────────────────────────────────
export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  const result = await createOrderInDB(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Order created successfully.',
    data: result as any,
  });
});

// ─── GET /api/orders ────────────────────────────────────────────────────
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

// ─── PUT /api/orders/:id/status ──────────────────────────────────────────
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
