import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { signupUser, loginUser, logoutUser, refreshAccessToken } from '../services/auth.service';
import type { SignupInput, LoginInput } from '../validators/auth.validator';
import { config } from '../config/config';
import ms from 'ms';
import { captureActivity } from '../utils/activity-logger';
import { ActivityType, AuthenticatedRequest } from '../types';

const refreshExpiresIn = ms(config.jwt.refreshExpiresIn as ms.StringValue);
const cookieOptions = {
  httpOnly: true,
  secure: config.server.nodeEnv === 'production',
  sameSite: 'lax' as const,
  maxAge: typeof refreshExpiresIn === 'number' ? refreshExpiresIn : undefined,
};

// ─── POST /api/auth/signup (Public) ───────────────────────────────────────────
export const signup = catchAsync(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await signupUser(req.body as SignupInput);

  res.cookie('refreshToken', refreshToken, cookieOptions);

  await captureActivity(req, {
    type: ActivityType.CREATE,
    resource: 'USER',
    action_text: `New account created: ${user.email}`,
    details: { email: user.email, role: user.role },
    userId: user.id,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Account created successfully.',
    data: {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    },
  });
});

// ─── POST /api/auth/login (Public) ────────────────────────────────────────────
export const login = catchAsync(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await loginUser(req.body as LoginInput);

  res.cookie('refreshToken', refreshToken, cookieOptions);

  await captureActivity(req, {
    type: ActivityType.LOGIN,
    action_text: `User logged in: ${user.email}`,
    details: { email: user.email, role: user.role },
    userId: user.id,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully.',
    data: {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    },
  });
});

// ─── POST /api/auth/refresh-token  ────────────────────────────────────
export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = (req.body as { refreshToken?: string })?.refreshToken || req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token provided.' });
  }

  const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(token);
  res.cookie('refreshToken', newRefreshToken, cookieOptions);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Access token refreshed.',
    data: { accessToken, refreshToken: newRefreshToken },
  });
});

// ─── POST /api/auth/logout (Public — no protect needed) ───────────────────────
export const logout = catchAsync(async (req: Request, res: Response) => {
  const token = (req.body as { refreshToken?: string })?.refreshToken || req.cookies?.refreshToken;

  if (token) {
    await logoutUser(req, token);
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.server.nodeEnv === 'production',
    sameSite: 'lax' as const,
  });

  sendResponse(res, { statusCode: 200, success: true, message: 'Logged out successfully.' });
});

// ─── GET /api/auth/me (Private) ───────────────────────────────────────────────
export const me = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User retrieved successfully.',
    data: { user: { id: user!.id, email: user!.email, role: user!.role } },
  });
});
