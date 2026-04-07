import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { signupUser, loginUser, logoutUser, refreshAccessToken } from '../services/auth.service';
import type { SignupInput, LoginInput } from '../validators/auth.validator';

// ─── POST /api/auth/signup (Public) ───────────────────────────────────────────
export const signup = catchAsync(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await signupUser(req.body as SignupInput);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Account created successfully.',
    data: {
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, role: user.role },
    },
  });
});

// ─── POST /api/auth/login (Public) ────────────────────────────────────────────
export const login = catchAsync(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await loginUser(req.body as LoginInput);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully.',
    data: {
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, role: user.role },
    },
  });
});

// ─── POST /api/auth/refresh-token  ────────────────────────────────────
export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body as { refreshToken?: string };

  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token provided.' });
  }

  const { accessToken } = await refreshAccessToken(token);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Access token refreshed.',
    data: { accessToken },
  });
});

// ─── POST /api/auth/logout (Public — no protect needed) ───────────────────────
export const logout = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body as { refreshToken?: string };

  if (token) {
    await logoutUser(token);
  }

  sendResponse(res, { statusCode: 200, success: true, message: 'Logged out successfully.' });
});

// ─── GET /api/auth/me (Private) ───────────────────────────────────────────────
export const me = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User retrieved successfully.',
    data: { user: { id: user._id, email: user.email, role: user.role } },
  });
});
