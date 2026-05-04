import crypto from 'crypto';
import ms from 'ms';
import { Invitation } from '@prisma/client';
import prisma from '../config/prisma';
import { AppError } from '../utils/AppError';
import { sendInvitationEmail } from '../utils/email';
import { UserRole } from '../types';
import { logger } from '../utils/logger';
import { config } from '../config/config';

export const createInvitation = async (
  email: string,
  role: UserRole,
  invitedBy: string,
): Promise<Invitation> => {
  // Check if invitation already exists and is not used
  const existing = await prisma.invitation.findUnique({
    where: { email },
  });

  if (existing && !existing.used && existing.expiresAt > new Date()) {
    throw new AppError('A valid invitation already exists for this email.', 400);
  }

  // Generate token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + ms(config.invitation.expiresIn as ms.StringValue));

  // If there was an expired or used invitation, we can just update it or delete and recreate
  // Prisma doesn't have an easy "delete if exists", so we'll just upsert or delete manually
  if (existing) {
    await prisma.invitation.delete({ where: { id: existing.id } });
  }

  const invitation = await prisma.invitation.create({
    data: {
      email,
      token,
      role,
      expiresAt,
      userId: invitedBy,
    },
  });

  // Send email in background (non-blocking)
  sendInvitationEmail(email, token).catch((err) => {
    logger.error(`Background email sending failed: ${err.message}`);
  });

  return invitation;
};

export const validateInvitation = async (email: string, token: string): Promise<Invitation> => {
  const invitation = await prisma.invitation.findFirst({
    where: { email, token, used: false },
  });

  if (!invitation) {
    throw new AppError('Invalid or unauthorized invitation.', 401);
  }

  if (invitation.expiresAt < new Date()) {
    throw new AppError('This invitation has expired.', 401);
  }

  return invitation;
};

export const markInvitationAsUsed = async (id: string): Promise<void> => {
  await prisma.invitation.update({
    where: { id },
    data: { used: true },
  });
};

export const getAllInvitations = async () => {
  return prisma.invitation.findMany({
    include: {
      invitedBy: {
        select: {
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const deleteInvitation = async (id: string) => {
  try {
    await prisma.invitation.delete({
      where: { id },
    });
  } catch (error) {
    throw new AppError('Invitation not found.', 404);
  }
};
