import User, { IUserDocument } from '../models/user.model';
import Session from '../models/session.model';
import { AppError } from '../utils/AppError';
import type { SignupInput, LoginInput } from '../validators/auth.validator';
import jwt from 'jsonwebtoken';
import ms from 'ms';

/**
 * Creates a session in the database
 */
const createSession = async (userId: any, token: string) => {
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as any;
  const expiresAt = new Date(Date.now() + ms(expiresIn));

  await Session.create({
    userId,
    token,
    expiresAt,
  });
};

// ─── POST /api/auth/signup (Permissions: Public) ────────────────────────────────
export const signupUser = async (
  data: SignupInput,
): Promise<{ user: IUserDocument; token: string }> => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  // password_hash triggers the pre-save bcrypt hook in user.model.ts
  const user = await User.create({
    email: data.email,
    password_hash: data.password,
    role: data.role,
  });

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions,
  );

  // Save session to DB
  await createSession(user._id, token);

  return { user, token };
};

// ─── POST /api/auth/login (Permissions: Public) ─────────────────────────────────
export const loginUser = async (
  data: LoginInput,
): Promise<{ user: IUserDocument; token: string }> => {
  const user = await User.findOne({ email: data.email }).select('+password_hash');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(data.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions,
  );

  // Save session to DB
  await createSession(user._id, token);

  // Return user without password_hash
  user.password_hash = undefined as any;

  return { user, token };
};

// ─── POST /api/auth/logout (Permissions: Private) ─────────────────────────────────
export const logoutUser = async (token: string): Promise<void> => {
  await Session.deleteOne({ token });
};
