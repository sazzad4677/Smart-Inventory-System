import crypto from 'crypto';
import ms from 'ms';
import Invitation, { IInvitationDocument } from '../models/invitation.model';
import { AppError } from '../utils/AppError';
import { sendInvitationEmail } from '../utils/email';
import { UserRole } from '../types';
import { Types } from 'mongoose';
import { logger } from '../utils/logger';
import { config } from '../config/config';

export const createInvitation = async (
  email: string,
  role: UserRole,
  invitedBy: Types.ObjectId,
): Promise<IInvitationDocument> => {
  // Check if invitation already exists and is not used
  const existing = await Invitation.findOne({ email, used: false });
  if (existing && existing.expiresAt > new Date()) {
    throw new AppError('A valid invitation already exists for this email.', 400);
  }

  // Generate token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + ms(config.invitation.expiresIn as any));

  // If there was an expired invitation, delete it
  if (existing) {
    await Invitation.deleteOne({ _id: existing._id });
  }

  const invitation = await Invitation.create({
    email,
    token,
    role,
    expiresAt,
    invitedBy,
  });

  // Send email in background (non-blocking)
  sendInvitationEmail(email, token).catch((err) => {
    logger.error(`Background email sending failed: ${err.message}`);
  });

  return invitation;
};

export const validateInvitation = async (
  email: string,
  token: string,
): Promise<IInvitationDocument> => {
  const invitation = await Invitation.findOne({ email, token, used: false });

  if (!invitation) {
    throw new AppError('Invalid or unauthorized invitation.', 401);
  }

  if (invitation.expiresAt < new Date()) {
    throw new AppError('This invitation has expired.', 401);
  }

  return invitation;
};

export const markInvitationAsUsed = async (id: Types.ObjectId): Promise<void> => {
  await Invitation.findByIdAndUpdate(id, { used: true });
};

export const getAllInvitations = async () => {
  return Invitation.find().populate('invitedBy', 'email role').sort({ createdAt: -1 });
};

export const deleteInvitation = async (id: string) => {
  const result = await Invitation.findByIdAndDelete(id);
  if (!result) {
    throw new AppError('Invitation not found.', 404);
  }
};
