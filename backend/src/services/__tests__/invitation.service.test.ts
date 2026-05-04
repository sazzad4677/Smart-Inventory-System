import prisma from '../../config/prisma';
import {
  createInvitation,
  validateInvitation,
  markInvitationAsUsed,
  getAllInvitations,
  deleteInvitation,
} from '../invitation.service';
import { AppError } from '../../utils/AppError';
import { UserRole } from '../../types';
import { sendInvitationEmail } from '../../utils/email';

// Mock dependencies
jest.mock('../../utils/email', () => ({
  sendInvitationEmail: jest.fn().mockResolvedValue(true),
}));

describe('Invitation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createInvitation', () => {
    it('should successfully create an invitation', async () => {
      (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.invitation.create as jest.Mock).mockResolvedValue({
        id: 'inv1',
        email: 'test@test.com',
        role: UserRole.Manager,
      });

      const result = await createInvitation('test@test.com', UserRole.Manager, 'admin1');

      expect(prisma.invitation.create).toHaveBeenCalled();
      expect(result.email).toBe('test@test.com');
      expect(sendInvitationEmail).toHaveBeenCalledWith('test@test.com', expect.any(String));
    });

    it('should throw error if valid invitation already exists', async () => {
      (prisma.invitation.findUnique as jest.Mock).mockResolvedValue({
        used: false,
        expiresAt: new Date(Date.now() + 10000),
      });

      await expect(createInvitation('test@test.com', UserRole.Manager, 'admin1')).rejects.toThrow(
        new AppError('A valid invitation already exists for this email.', 400),
      );
    });

    it('should delete old invitation if it was used or expired', async () => {
      (prisma.invitation.findUnique as jest.Mock).mockResolvedValue({
        id: 'old-inv',
        used: true,
      });
      (prisma.invitation.create as jest.Mock).mockResolvedValue({ id: 'new-inv' });

      await createInvitation('test@test.com', UserRole.Manager, 'admin1');

      expect(prisma.invitation.delete).toHaveBeenCalledWith({ where: { id: 'old-inv' } });
    });
  });

  describe('validateInvitation', () => {
    it('should return invitation if valid', async () => {
      const mockInv = {
        id: 'inv1',
        email: 'test@test.com',
        token: 'tok123',
        used: false,
        expiresAt: new Date(Date.now() + 10000),
      };
      (prisma.invitation.findFirst as jest.Mock).mockResolvedValue(mockInv);

      const result = await validateInvitation('test@test.com', 'tok123');

      expect(result).toEqual(mockInv);
    });

    it('should throw error if invitation not found', async () => {
      (prisma.invitation.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(validateInvitation('test@test.com', 'tok123')).rejects.toThrow(
        new AppError('Invalid or unauthorized invitation.', 401),
      );
    });

    it('should throw error if invitation is expired', async () => {
      const mockInv = {
        expiresAt: new Date(Date.now() - 10000),
      };
      (prisma.invitation.findFirst as jest.Mock).mockResolvedValue(mockInv);

      await expect(validateInvitation('test@test.com', 'tok123')).rejects.toThrow(
        new AppError('This invitation has expired.', 401),
      );
    });
  });

  describe('markInvitationAsUsed', () => {
    it('should update invitation as used', async () => {
      (prisma.invitation.update as jest.Mock).mockResolvedValue({ id: 'inv1', used: true });
      await markInvitationAsUsed('inv1');
      expect(prisma.invitation.update).toHaveBeenCalledWith({
        where: { id: 'inv1' },
        data: { used: true },
      });
    });
  });

  describe('getAllInvitations', () => {
    it('should return all invitations', async () => {
      (prisma.invitation.findMany as jest.Mock).mockResolvedValue([]);
      await getAllInvitations();
      expect(prisma.invitation.findMany).toHaveBeenCalled();
    });
  });

  describe('deleteInvitation', () => {
    it('should delete invitation', async () => {
      (prisma.invitation.delete as jest.Mock).mockResolvedValue({});
      await deleteInvitation('inv1');
      expect(prisma.invitation.delete).toHaveBeenCalledWith({ where: { id: 'inv1' } });
    });

    it('should throw 404 if invitation not found', async () => {
      (prisma.invitation.delete as jest.Mock).mockRejectedValue(new Error('NotFound'));
      await expect(deleteInvitation('inv1')).rejects.toThrow(
        new AppError('Invitation not found.', 404),
      );
    });
  });
});
