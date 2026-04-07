import User, { IUserDocument } from '../models/user.model';
import Session from '../models/session.model';
import ActivityLog from '../models/activity-log.model';
import { AppError } from '../utils/AppError';
import type { SignupInput, LoginInput } from '../validators/auth.validator';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { config } from '../config/config';

// ─── Token Generation ──────────────────────────────────────────────────────────

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const generateTokens = (userId: any, role: string): TokenPair => {
  const accessToken = jwt.sign({ id: userId, role }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

/**
 * Creates a session storing the refresh token in the database.
 */
const createSession = async (userId: any, refreshToken: string): Promise<void> => {
  const expiresAt = new Date(Date.now() + ms(config.jwt.refreshExpiresIn as any));
  await Session.create({ userId, refreshToken, expiresAt });
};

// ─── POST /api/auth/signup ─────────────────────────────────────────────────────

export const signupUser = async (
  data: SignupInput,
): Promise<{ user: IUserDocument; accessToken: string; refreshToken: string }> => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const user = await User.create({
    email: data.email,
    password_hash: data.password,
    role: data.role,
  });

  const { accessToken, refreshToken } = generateTokens(user._id, user.role);
  await createSession(user._id, refreshToken);

  return { user, accessToken, refreshToken };
};

// ─── POST /api/auth/login ──────────────────────────────────────────────────────

export const loginUser = async (
  data: LoginInput,
): Promise<{ user: IUserDocument; accessToken: string; refreshToken: string }> => {
  const user = await User.findOne({ email: data.email }).select('+password_hash');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(data.password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const { accessToken, refreshToken } = generateTokens(user._id, user.role);
  await createSession(user._id, refreshToken);

  user.password_hash = undefined as any;
  return { user, accessToken, refreshToken };
};

// ─── POST /api/auth/refresh-token ─────────────────────────────────────────────

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<{ accessToken: string }> => {
  // 1) Verify the refresh token signature + expiry
  let decoded: jwt.JwtPayload;
  try {
    decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as jwt.JwtPayload;
  } catch {
    throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
  }

  // 2) Confirm the session exists in DB (handles explicit logout / revocation)
  const session = await Session.findOne({ refreshToken });
  if (!session) {
    throw new AppError('Session has been revoked. Please log in again.', 401);
  }

  // 3) Confirm user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('The user belonging to this session no longer exists.', 401);
  }

  // 4) Issue a new short-lived access token
  const accessToken = jwt.sign({ id: user._id, role: user.role }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  } as jwt.SignOptions);

  return { accessToken };
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

export const logoutUser = async (refreshToken: string): Promise<void> => {
  const session = await Session.findOne({ refreshToken });
  if (session) {
    const user = await User.findById(session.userId);
    if (user) {
      await ActivityLog.create({
        user_id: user._id,
        action_text: `User ${user.email} logged out.`,
      });
    }
    await session.deleteOne();
  }
};
