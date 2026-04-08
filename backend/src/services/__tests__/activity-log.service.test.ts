import { getAllActivityLogsFromDB } from '../activity-log.service';
import ActivityLog from '../../models/activity-log.model';
import User from '../../models/user.model';
import QueryBuilder from '../../builders/QueryBuilder';

// Mock models and QueryBuilder
jest.mock('../../models/activity-log.model');
jest.mock('../../models/user.model');
jest.mock('../../builders/QueryBuilder');

describe('Activity Log Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllActivityLogsFromDB', () => {
    it('should return logs and meta on success', async () => {
      const mockResult = [{ action_text: 'Logged in' }];
      const mockMeta = { total: 1 };

      const mockQueryBuilderInstance = {
        search: jest.fn().mockReturnThis(),
        filter: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        paginate: jest.fn().mockReturnThis(),
        fields: jest.fn().mockReturnThis(),
        modelQuery: Promise.resolve(mockResult),
        countTotal: jest.fn().mockResolvedValue(mockMeta),
      };

      (ActivityLog.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
      });
      (QueryBuilder as jest.Mock).mockImplementation(() => mockQueryBuilderInstance);

      const result = await getAllActivityLogsFromDB({});

      expect(ActivityLog.find).toHaveBeenCalled();
      expect(QueryBuilder).toHaveBeenCalled();
      expect(result.result).toEqual(mockResult);
      expect(result.meta).toEqual(mockMeta);
    });

    it('should filter logs by user IDs if role is provided in query', async () => {
      const query = { role: 'Admin' };
      const mockUsers = [{ _id: 'user1' }, { _id: 'user2' }];

      (User.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers),
      });

      const mockQueryBuilderInstance = {
        search: jest.fn().mockReturnThis(),
        filter: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        paginate: jest.fn().mockReturnThis(),
        fields: jest.fn().mockReturnThis(),
        modelQuery: Promise.resolve([]),
        countTotal: jest.fn().mockResolvedValue({ total: 0 }),
      };

      (ActivityLog.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
      });
      (QueryBuilder as jest.Mock).mockImplementation(() => mockQueryBuilderInstance);

      await getAllActivityLogsFromDB(query);

      expect(User.find).toHaveBeenCalledWith({ role: 'Admin' });
      // Verify that QueryBuilder was called with the resolved user IDs
      expect(QueryBuilder).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ user_id: { $in: ['user1', 'user2'] } }),
      );
    });
  });
});
