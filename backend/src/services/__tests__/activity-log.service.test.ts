import {
  getAllActivityLogsFromDB,
  undoActivityInDB,
  redoActivityInDB,
} from '../activity-log.service';
import ActivityLog from '../../models/activity-log.model';
import User from '../../models/user.model';
import Product from '../../models/product.model';
import QueryBuilder from '../../builders/QueryBuilder';
import { ActivityType } from '../../types';

// Mock models and QueryBuilder
jest.mock('../../models/activity-log.model');
jest.mock('../../models/user.model');
jest.mock('../../builders/QueryBuilder');
jest.mock('../../models/product.model');

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

      await getAllActivityLogsFromDB(query, { _id: 'admin1', role: 'Admin' });

      expect(User.find).toHaveBeenCalledWith({ role: 'Admin' });
      expect(QueryBuilder).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ user_id: { $in: ['user1', 'user2'] } }),
      );
    });

    it('should restrict logs for non-Admin users to their own logs', async () => {
      const mockResult = [{ action_text: 'Own log' }];
      const mockQueryBuilderInstance = {
        search: jest.fn().mockReturnThis(),
        filter: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        paginate: jest.fn().mockReturnThis(),
        fields: jest.fn().mockReturnThis(),
        modelQuery: Promise.resolve(mockResult),
        countTotal: jest.fn().mockResolvedValue({ total: 1 }),
      };

      (ActivityLog.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
      });
      (QueryBuilder as jest.Mock).mockImplementation(() => mockQueryBuilderInstance);

      const result = await getAllActivityLogsFromDB({}, { _id: 'user123', role: 'Staff' });

      expect(QueryBuilder).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ user_id: 'user123' }),
      );
      expect(result.result).toEqual(mockResult);
    });
  });

  describe('undoActivityInDB', () => {
    it('should successfully restore a soft-deleted product', async () => {
      const mockLog = {
        _id: 'log1',
        type: ActivityType.Delete,
        resource: 'PRODUCT',
        resource_id: 'prod1',
        save: jest.fn().mockResolvedValue(true),
      };
      const mockProduct = {
        _id: 'prod1',
        name: 'Test Product',
        is_deleted: true,
        save: jest.fn().mockResolvedValue(true),
      };

      (ActivityLog.findById as jest.Mock).mockResolvedValue(mockLog);
      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);

      const result = await undoActivityInDB('log1');

      expect(Product.findById).toHaveBeenCalledWith('prod1');
      expect(mockProduct.is_deleted).toBe(false);
      expect(mockProduct.save).toHaveBeenCalled();
      expect((mockLog as any).is_undone).toBe(true);
      expect(mockLog.save).toHaveBeenCalled();
      expect(result.message).toContain('restored successfully');
    });

    it('should throw error if log is not found', async () => {
      (ActivityLog.findById as jest.Mock).mockResolvedValue(null);

      await expect(undoActivityInDB('invalid')).rejects.toThrow('Activity log not found');
    });

    it('should throw error if production is not undoable', async () => {
      const mockLog = { type: ActivityType.Login };
      (ActivityLog.findById as jest.Mock).mockResolvedValue(mockLog);

      await expect(undoActivityInDB('log1')).rejects.toThrow('This action cannot be undone');
    });

    it('should throw error if original product is missing', async () => {
      const mockLog = {
        type: ActivityType.Delete,
        resource: 'PRODUCT',
        resource_id: 'prod1',
        save: jest.fn().mockResolvedValue(true),
      };
      (ActivityLog.findById as jest.Mock).mockResolvedValue(mockLog);
      (Product.findById as jest.Mock).mockResolvedValue(null);

      await expect(undoActivityInDB('log1')).rejects.toThrow('Original product not found');
    });
  });

  describe('redoActivityInDB', () => {
    it('should successfully redo a deleted product', async () => {
      const mockLog = {
        _id: 'log1',
        type: ActivityType.Delete,
        resource: 'PRODUCT',
        resource_id: 'prod1',
        is_undone: true,
        save: jest.fn().mockResolvedValue(true),
      };
      const mockProduct = {
        _id: 'prod1',
        name: 'Test Product',
        is_deleted: false,
        save: jest.fn().mockResolvedValue(true),
      };

      (ActivityLog.findById as jest.Mock).mockResolvedValue(mockLog);
      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);

      const result = await redoActivityInDB('log1');

      expect(Product.findById).toHaveBeenCalledWith('prod1');
      expect(mockProduct.is_deleted).toBe(true);
      expect(mockProduct.save).toHaveBeenCalled();
      expect((mockLog as any).is_undone).toBe(false);
      expect(mockLog.save).toHaveBeenCalled();
      expect(result.message).toContain('deleted again (Redo)');
    });

    it('should throw error if action has not been undone', async () => {
      const mockLog = { is_undone: false };
      (ActivityLog.findById as jest.Mock).mockResolvedValue(mockLog);

      await expect(redoActivityInDB('log1')).rejects.toThrow('This action has not been undone');
    });

    it('should throw error if action type is not redoable', async () => {
      const mockLog = {
        type: ActivityType.Login,
        is_undone: true,
        save: jest.fn().mockResolvedValue(true),
      };
      (ActivityLog.findById as jest.Mock).mockResolvedValue(mockLog);

      await expect(redoActivityInDB('log1')).rejects.toThrow('This action cannot be redone');
    });

    it('should throw error if original product is missing during redo', async () => {
      const mockLog = {
        type: ActivityType.Delete,
        resource: 'PRODUCT',
        resource_id: 'prod1',
        is_undone: true,
        save: jest.fn().mockResolvedValue(true),
      };
      (ActivityLog.findById as jest.Mock).mockResolvedValue(mockLog);
      (Product.findById as jest.Mock).mockResolvedValue(null);

      await expect(redoActivityInDB('log1')).rejects.toThrow('Original product not found');
    });
  });
});
