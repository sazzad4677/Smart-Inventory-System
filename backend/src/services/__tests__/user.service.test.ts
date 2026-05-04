import prisma from '../../config/prisma';
import { getAllUsersWithSessions, revokeUserSessions } from '../user.service';

// Mock dependencies
jest.mock('../../config/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
    },
    session: {
      deleteMany: jest.fn(),
    },
  },
}));

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsersWithSessions', () => {
    it('should return users with session counts and last activity', async () => {
      const date = new Date();
      const mockUsers = [
        {
          id: 'u1',
          email: 'test@test.com',
          role: 'Admin',
          createdAt: date,
          sessions: [
            { updatedAt: new Date(date.getTime() + 1000) },
            { updatedAt: new Date(date.getTime() + 2000) },
          ],
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getAllUsersWithSessions();

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(result[0].activeSessionCount).toBe(2);
      expect(result[0].lastActivity).toEqual(new Date(date.getTime() + 2000));
    });
  });

  describe('revokeUserSessions', () => {
    it('should delete all sessions for a user', async () => {
      (prisma.session.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await revokeUserSessions('u1');

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { userId: 'u1' } });
      expect(result.count).toBe(2);
    });
  });
});
