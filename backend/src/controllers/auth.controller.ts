import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { signupUser, loginUser } from '../services/auth.service';
import type { SignupInput, LoginInput } from '../validators/auth.validator';

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
export const signup = catchAsync(async (req: Request, res: Response) => {
  const user = await signupUser(req.body as SignupInput);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Account created successfully.',
    data: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
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
