import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import {
  getRestockQueueFromDB,
  getDashboardStatsFromDB,
  getLatestActivitiesFromDB,
} from '../services/dashboard.service';

// ─── GET /api/dashboard/restock-queue (Permissions: Admin, Manager) ──────────
export const getRestockQueue = catchAsync(async (req: Request, res: Response) => {
  const result = await getRestockQueueFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Restock queue fetched successfully.',
    data: result,
  });
});

// ─── GET /api/dashboard/dashboard (Permissions: Admin, Manager) ──────────────
export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await getDashboardStatsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dashboard statistics fetched successfully.',
    data: result,
  });
});

// ─── GET /api/dashboard/activities (Permissions: Admin, Manager) ─────────────
export const getLatestActivities = catchAsync(async (req: Request, res: Response) => {
  const result = await getLatestActivitiesFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Latest activities fetched successfully.',
    data: result,
  });
});
