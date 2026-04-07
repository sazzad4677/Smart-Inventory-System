import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { getAllActivityLogsFromDB } from '../services/activity-log.service';

// ─── GET /api/activity-logs (Permissions: Admin Only) ──────────────────────────
export const getAllActivityLogs = catchAsync(async (req: Request, res: Response) => {
  const { meta, result } = await getAllActivityLogsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Activity logs fetched successfully.',
    meta,
    data: result,
  });
});
