import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { getDashboardStatsFromDB, getLatestActivitiesFromDB } from '../services/dashboard.service';

import { redisClient } from '../config/redis';
import { AuthenticatedRequest } from '../types';

// ─── GET /api/dashboard/dashboard (Permissions: Admin, Manager) ──────────────
export const getDashboardMetrics = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
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

// ─── GET /api/dashboard/activities (Permissions: All Authenticated Users) ─────────────
export const getLatestActivities = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const result = await getLatestActivitiesFromDB({
    id: user!.id,
    role: user!.role,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Latest activities fetched successfully.',
    data: result,
  });
});
