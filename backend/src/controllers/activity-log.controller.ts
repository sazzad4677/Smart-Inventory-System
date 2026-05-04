import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { AppError } from '../utils/AppError';
import {
  getAllActivityLogsFromDB,
  undoActivityInDB,
  redoActivityInDB,
} from '../services/activity-log.service';
import { AuthenticatedRequest } from '../types';

// ─── GET /api/activity-logs (Permissions: All Authenticated Users) ───────────────────
export const getAllActivityLogs = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const { meta, result } = await getAllActivityLogsFromDB(req.query as Record<string, unknown>, {
    id: user!.id,
    role: user!.role,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Activity logs fetched successfully.',
    meta,
    data: result,
  });
});

// ─── POST /api/activity-logs/:id/undo (Permissions: Admin, Manager) ──────────────────
export const undoActivity = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (!id) throw new AppError('Activity ID is required', 400);

  const result = await undoActivityInDB(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result.product,
  });
});

// ─── POST /api/activity-logs/:id/redo (Permissions: Admin, Manager) ──────────────────
export const redoActivity = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (!id) throw new AppError('Activity ID is required', 400);

  const result = await redoActivityInDB(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result.product,
  });
});
