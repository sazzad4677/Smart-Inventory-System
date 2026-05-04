import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import * as invitationService from '../services/invitation.service';
import { InviteUserInput } from '../validators/invitation.validator';
import { captureActivity } from '../utils/activity-logger';
import { ActivityType, AuthenticatedRequest, UserRole } from '../types';

export const inviteUser = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { email, role } = req.body as InviteUserInput;
  const user = req.user!;

  const invitation = await invitationService.createInvitation(email, role as UserRole, user.id);

  await captureActivity(req, {
    type: ActivityType.CREATE,
    resource: 'INVITATION',
    action_text: `User ${user.email} invited ${email} as ${role}.`,
    details: { email, role },
    userId: user.id,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Invitation sent successfully.',
    data: invitation,
  });
});

export const getInvitations = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const invitations = await invitationService.getAllInvitations();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Invitations retrieved successfully.',
    data: invitations,
  });
});

export const revokeInvitation = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await invitationService.deleteInvitation(id as string);

  await captureActivity(req, {
    type: ActivityType.DELETE,
    resource: 'INVITATION',
    action_text: `Invitation ${id} revoked.`,
    userId: req.user!.id,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Invitation revoked successfully.',
  });
});
