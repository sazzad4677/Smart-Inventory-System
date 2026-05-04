import prisma from '../config/prisma';
import { AppError } from '../utils/AppError';
import type { SignupInput, LoginInput } from '../validators/auth.validator';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { config } from '../config/config';
import { captureActivity } from '../utils/activity-logger';
import { ActivityType, IUser } from '../types';
import { Request } from 'express';
import bcrypt from 'bcryptjs';
import { validateInvitation, markInvitationAsUsed } from './invitation.service';

// ─── Token Generation ──────────────────────────────────────────────────────────

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const generateTokens = (userId: string, role: string, sessionId: string): TokenPair => {
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
  sessionId: string,
  userId: string,
  refreshToken: string,
): Promise<void> => {
  const expiresAt = new Date(Date.now() + ms(config.jwt.refreshExpiresIn as ms.StringValue));
  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      refreshToken,
      expiresAt,
    },
  });
};

const setupUserSession = async (user: IUser): Promise<TokenPair> => {
  const sessionId = crypto.randomUUID(); // Use native crypto for UUIDs
  const tokens = generateTokens(user.id, user.role, sessionId);
  await createSession(sessionId, user.id, tokens.refreshToken);
  return tokens;
};

// ─── POST /api/auth/signup ─────────────────────────────────────────────────────

export const signupUser = async (
  data: SignupInput & { token: string },
): Promise<{ user: Omit<IUser, 'password_hash'>; accessToken: string; refreshToken: string }> => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  // Validate Invitation
  const invitation = await validateInvitation(data.email, data.token);

  // Hash password manually (since Mongoose pre-save hook is gone)
  const salt = await bcrypt.genSalt(12);
  const password_hash = await bcrypt.hash(data.password, salt);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password_hash,
      role: invitation.role, // Always take role from invitation
    },
  });

  // Mark invitation as used
  await markInvitationAsUsed(invitation.id);

  const { accessToken, refreshToken } = await setupUserSession(user);

  const { password_hash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, refreshToken };
};

// ─── POST /api/auth/login ──────────────────────────────────────────────────────

export const loginUser = async (
  data: LoginInput,
): Promise<{ user: Omit<IUser, 'password_hash'>; accessToken: string; refreshToken: string }> => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await bcrypt.compare(data.password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const { accessToken, refreshToken } = await setupUserSession(user);

  const { password_hash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, refreshToken };
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
  const session = await prisma.session.findUnique({
    where: { refreshToken },
  });
  if (!session) {
    throw new AppError('Session has been revoked or already rotated. Please log in again.', 401);
  }

  // Confirm user still exists
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });
  if (!user) {
    throw new AppError('The user belonging to this session no longer exists.', 401);
  }

  // Issue a new pair of tokens (Rotation)
  const sessionId = session.id;
  const tokens = generateTokens(user.id, user.role, sessionId);

  // Update the session with the new refresh token
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + ms(config.jwt.refreshExpiresIn as ms.StringValue)),
    },
  });

  return tokens;
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

export const logoutUser = async (req: Request, refreshToken: string): Promise<void> => {
  const session = await prisma.session.findUnique({
    where: { refreshToken },
    include: { user: true },
  });

  if (session) {
    if (session.user) {
      await captureActivity(req, {
        type: ActivityType.LOGOUT,
        action_text: `User ${session.user.email} logged out.`,
        userId: session.user.id,
      });
    }
    await prisma.session.delete({
      where: { id: session.id },
    });
  }
};
