import User, { IUserDocument } from '../models/user.model';
import Session from '../models/session.model';
import ActivityLog from '../models/activity-log.model';
import { AppError } from '../utils/AppError';
import type { SignupInput, LoginInput } from '../validators/auth.validator';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { config } from '../config/config';
import { Types } from 'mongoose';

// ─── Token Generation ──────────────────────────────────────────────────────────

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const generateTokens = (
  userId: Types.ObjectId,
  role: string,
  sessionId: Types.ObjectId,
): TokenPair => {
  const timestamp = Date.now();
  const accessToken = jwt.sign(
    { id: userId, role, sessionId, timestamp },
    config.jwt.accessSecret,
    {
      expiresIn: config.jwt.accessExpiresIn,
    } as jwt.SignOptions,
  );

  const refreshToken = jwt.sign({ id: userId, sessionId, timestamp }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

/**
 * Creates a session storing the refresh token in the database.
 */
const createSession = async (
  sessionId: Types.ObjectId,
  userId: Types.ObjectId,
  refreshToken: string,
): Promise<void> => {
  const expiresAt = new Date(Date.now() + ms(config.jwt.refreshExpiresIn as any));
  await Session.create({ _id: sessionId, userId, refreshToken, expiresAt });
};

const setupUserSession = async (user: IUserDocument): Promise<TokenPair> => {
  const sessionId = new Types.ObjectId();
  const tokens = generateTokens(user._id as Types.ObjectId, user.role, sessionId);
  await createSession(sessionId, user._id as Types.ObjectId, tokens.refreshToken);
  return tokens;
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

  const { accessToken, refreshToken } = await setupUserSession(user);

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

  const { accessToken, refreshToken } = await setupUserSession(user);

  user.password_hash = undefined as any;
  return { user, accessToken, refreshToken };
};

// ─── POST /api/auth/refresh-token ─────────────────────────────────────────────

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  // Verify the refresh token signature + expiry
  let decoded: jwt.JwtPayload;
  try {
    decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as jwt.JwtPayload;
  } catch {
    throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
  }

  // Confirm the session exists in DB (handles explicit logout / revocation)
  const session = await Session.findOne({ refreshToken });
  if (!session) {
    throw new AppError('Session has been revoked or already rotated. Please log in again.', 401);
  }

  // Confirm user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('The user belonging to this session no longer exists.', 401);
  }

  // Issue a new pair of tokens (Rotation)
  const sessionId = session._id as Types.ObjectId;
  const tokens = generateTokens(user._id as Types.ObjectId, user.role, sessionId);

  // Update the session with the new refresh token
  session.refreshToken = tokens.refreshToken;
  session.expiresAt = new Date(Date.now() + ms(config.jwt.refreshExpiresIn as any));
  await session.save();

  return tokens;
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
