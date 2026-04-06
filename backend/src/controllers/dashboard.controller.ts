import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { getDashboardStatsFromDB, getLatestActivitiesFromDB } from '../services/dashboard.service';

import { redisClient } from '../config/redis';

// ─── GET /api/dashboard/dashboard (Permissions: Admin, Manager) ──────────────
export const getDashboardMetrics = catchAsync(async (req: Request, res: Response) => {
  const result = await getDashboardStatsFromDB();

  // Cache the result for 5 minutes (300 seconds)
  await redisClient.setEx('dashboard_metrics', 300, JSON.stringify(result));

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
