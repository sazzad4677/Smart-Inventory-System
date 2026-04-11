import * as invitationService from '../invitation.service';
import Invitation from '../../models/invitation.model';
import { UserRole } from '../../types';
import { Types } from 'mongoose';
import { AppError } from '../../utils/AppError';
import * as emailUtils from '../../utils/email';

jest.mock('../../models/invitation.model');
jest.mock('../../utils/email');

describe('Invitation Service Unit Tests', () => {
  const mockEmail = 'test@example.com';
  const mockRoleId = UserRole.Manager;
  const mockInvitedBy = new Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
    (emailUtils.sendInvitationEmail as jest.Mock).mockResolvedValue(undefined);
  });

  describe('createInvitation', () => {
    it('should successfully create a new invitation', async () => {
      (Invitation.findOne as jest.Mock).mockResolvedValue(null);
      (Invitation.create as jest.Mock).mockResolvedValue({
        email: mockEmail,
        token: 'token123',
      });

      const result = await invitationService.createInvitation(mockEmail, mockRoleId, mockInvitedBy);

      expect(Invitation.create).toHaveBeenCalled();
      expect(emailUtils.sendInvitationEmail).toHaveBeenCalled();
      expect(result.email).toBe(mockEmail);
    });

    it('should throw error if a valid invitation already exists', async () => {
      (Invitation.findOne as jest.Mock).mockResolvedValue({
        expiresAt: new Date(Date.now() + 100000),
      });

      await expect(
        invitationService.createInvitation(mockEmail, mockRoleId, mockInvitedBy),
      ).rejects.toThrow(AppError);
    });

    it('should delete expired invitation and create new one', async () => {
      const expiredInv = {
        _id: new Types.ObjectId(),
        expiresAt: new Date(Date.now() - 100000),
      };
      (Invitation.findOne as jest.Mock).mockResolvedValue(expiredInv);
      (Invitation.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
      (Invitation.create as jest.Mock).mockResolvedValue({ email: mockEmail });

      await invitationService.createInvitation(mockEmail, mockRoleId, mockInvitedBy);

      expect(Invitation.deleteOne).toHaveBeenCalledWith({ _id: expiredInv._id });
      expect(Invitation.create).toHaveBeenCalled();
    });
  });

  describe('validateInvitation', () => {
    it('should return invitation if valid', async () => {
      const mockInv = {
        email: mockEmail,
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 100000),
      };
      (Invitation.findOne as jest.Mock).mockResolvedValue(mockInv);

      const result = await invitationService.validateInvitation(mockEmail, 'valid-token');

      expect(result).toEqual(mockInv);
    });

    it('should throw error if invitation is not found', async () => {
      (Invitation.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        invitationService.validateInvitation(mockEmail, 'invalid-token'),
      ).rejects.toThrow('Invalid or unauthorized invitation.');
    });

    it('should throw error if invitation has expired', async () => {
      const expiredInv = {
        email: mockEmail,
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 100000),
      };
      (Invitation.findOne as jest.Mock).mockResolvedValue(expiredInv);

      await expect(
        invitationService.validateInvitation(mockEmail, 'expired-token'),
      ).rejects.toThrow('This invitation has expired.');
    });
  });

  describe('markInvitationAsUsed', () => {
    it('should update the used status of an invitation', async () => {
      const id = new Types.ObjectId();
      await invitationService.markInvitationAsUsed(id);
      expect(Invitation.findByIdAndUpdate).toHaveBeenCalledWith(id, { used: true });
    });
  });

  describe('getAllInvitations', () => {
    it('should return all invitations', async () => {
      const mockInvs = [{ email: 'one@test.com' }, { email: 'two@test.com' }];
      (Invitation.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockInvs),
        }),
      } as any);

      const result = await invitationService.getAllInvitations();

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockInvs);
    });
  });

  describe('deleteInvitation', () => {
    it('should successfully delete an invitation', async () => {
      (Invitation.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: 'some-id' });

      await invitationService.deleteInvitation('some-id');

      expect(Invitation.findByIdAndDelete).toHaveBeenCalledWith('some-id');
    });

    it('should throw 404 if invitation not found', async () => {
      (Invitation.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(invitationService.deleteInvitation('fake-id')).rejects.toThrow(
        'Invitation not found.',
      );
    });
  });
});
