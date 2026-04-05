import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { signupUser, loginUser, logoutUser } from '../services/auth.service';
import ActivityLog from '../models/activity-log.model';
import type { SignupInput, LoginInput } from '../validators/auth.validator';

// ─── POST /api/auth/signup (Permissions: Public) ────────────────────────────────
export const signup = catchAsync(async (req: Request, res: Response) => {
  const { user, token } = await signupUser(req.body as SignupInput);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Account created successfully.',
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// ─── POST /api/auth/login (Permissions: Public) ─────────────────────────────────
export const login = catchAsync(async (req: Request, res: Response) => {
  const { user, token } = await loginUser(req.body as LoginInput);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully.',
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// ─── POST /api/auth/logout (Permissions: Private) ─────────────────────────────────
export const logout = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = (req as any).user;

  if (token) {
    await logoutUser(token);
  }

  // Log the logout activity
  if (user) {
    await ActivityLog.create({
      user_id: user._id,
      action_text: `User ${user.email} logged out.`,
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Logged out successfully.',
  });
});
