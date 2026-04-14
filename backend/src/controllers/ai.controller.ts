import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { getDashboardStatsFromDB } from '../services/dashboard.service';
import * as aiService from '../services/ai.service';

export const getDashboardAIInsights = catchAsync(async (req: Request, res: Response) => {
  // Get current dashboard data
  const stats = await getDashboardStatsFromDB();

  // Generate insights
  const insights = await aiService.generateDashboardInsights(stats);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'AI insights generated successfully',
    data: {
      insights,
      timestamp: new Date().toISOString(),
    },
  });
});
