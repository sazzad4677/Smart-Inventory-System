import { inviteUser, getInvitations, revokeInvitation } from '../invitation.controller';
import * as invitationService from '../../services/invitation.service';
import { Request, Response } from 'express';
import { UserRole } from '../../types';

jest.mock('../../services/invitation.service');
jest.mock('../../utils/activity-logger');

describe('Invitation Controller', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {},
      user: { id: 'admin1', email: 'admin@test.com' },
      app: {
        get: jest.fn().mockReturnValue({ emit: jest.fn() }),
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('inviteUser', () => {
    it('should invite a user and return 201', async () => {
      req.body = { email: 'test@test.com', role: UserRole.Manager };
      (invitationService.createInvitation as jest.Mock).mockResolvedValue({ id: 'inv1' });

      await inviteUser(req as Request, res as Response, next);

      expect(invitationService.createInvitation).toHaveBeenCalledWith(
        'test@test.com',
        UserRole.Manager,
        'admin1',
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe('getInvitations', () => {
    it('should return all invitations', async () => {
      (invitationService.getAllInvitations as jest.Mock).mockResolvedValue([]);

      await getInvitations(req as Request, res as Response, next);

      expect(invitationService.getAllInvitations).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('revokeInvitation', () => {
    it('should revoke an invitation', async () => {
      req.params = { id: 'inv1' };
      (invitationService.deleteInvitation as jest.Mock).mockResolvedValue({});

      await revokeInvitation(req as Request, res as Response, next);

      expect(invitationService.deleteInvitation).toHaveBeenCalledWith('inv1');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
