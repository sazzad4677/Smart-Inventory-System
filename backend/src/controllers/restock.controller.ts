import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { getRestockQueueFromDB } from '../services/restock.service';

/**
 * GET /api/restock-queue (Permissions: Admin, Manager)
 * Retrieves the current queue of products needing restock.
 */
export const getRestockQueue = catchAsync(async (req: Request, res: Response) => {
  const result = await getRestockQueueFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Restock queue fetched successfully.',
    meta: result.meta,
    data: result.result,
  });
});
