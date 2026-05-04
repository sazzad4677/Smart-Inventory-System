import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import * as userService from '../services/user.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { captureActivity } from '../utils/activity-logger';
import { ActivityType } from '../types';

export const getUsers = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const users = await userService.getAllUsersWithSessions();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully.',
    data: users,
  });
});

export const revokeSessions = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.params.userId as string;

  if (!userId) {
    throw new Error('User ID is required');
  }

  await userService.revokeUserSessions(userId);

  await captureActivity(req, {
    type: ActivityType.UPDATE,
    resource: 'USER',
    action_text: `Admin ${req.user!.email} revoked all sessions for user ${userId}.`,
    details: { userId },
    userId: req.user!.id,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All sessions for the user have been revoked.',
  });
});
