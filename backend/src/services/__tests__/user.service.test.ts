import { getAllUsersWithSessions, revokeUserSessions } from '../user.service';
import User from '../../models/user.model';
import Session from '../../models/session.model';
import { Types } from 'mongoose';

jest.mock('../../models/user.model');
jest.mock('../../models/session.model');

describe('User Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsersWithSessions', () => {
    it('should return aggregated users with session counts', async () => {
      const mockResult = [
        {
          _id: new Types.ObjectId(),
          email: 'test@example.com',
          role: 'Admin',
          activeSessionCount: 2,
        },
      ];

      (User.aggregate as jest.Mock).mockResolvedValue(mockResult);

      const result = await getAllUsersWithSessions();

      expect(User.aggregate).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('revokeUserSessions', () => {
    it('should delete all sessions for a specific userId', async () => {
      const userId = new Types.ObjectId().toString();
      (Session.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 5 });

      const result = await revokeUserSessions(userId);

      expect(Session.deleteMany).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
      });
      expect(result.deletedCount).toBe(5);
    });
  });
});
