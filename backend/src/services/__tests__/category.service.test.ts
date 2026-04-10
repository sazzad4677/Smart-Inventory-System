import { createCategoryIntoDB, getAllCategoriesFromDB } from '../category.service';
import Category from '../../models/category.model';
import ActivityLog from '../../models/activity-log.model';
import QueryBuilder from '../../builders/QueryBuilder';
import { Types } from 'mongoose';

// Mock models and QueryBuilder
jest.mock('../../models/category.model');
jest.mock('../../models/activity-log.model');
jest.mock('../../builders/QueryBuilder');

describe('Category Service', () => {
  let req: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      ip: '127.0.0.1',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn().mockReturnValue('mock-agent'),
    };
  });

  describe('createCategoryIntoDB', () => {
    it('should successfully create a category and log activity', async () => {
      const userId = new Types.ObjectId();
      const payload = { name: 'Electronics' };
      (Category.create as jest.Mock).mockResolvedValue({ _id: 'cat123', name: 'Electronics' });
      (ActivityLog.create as jest.Mock).mockResolvedValue({});

      const result = await createCategoryIntoDB(req as any, userId, payload);

      expect(Category.create).toHaveBeenCalledWith(payload);
      expect(ActivityLog.create).toHaveBeenCalled();
      expect(result.name).toBe('Electronics');
    });
  });

  describe('getAllCategoriesFromDB', () => {
    it('should return categories and meta via QueryBuilder', async () => {
      const mockResult = [{ name: 'Electronics' }];
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

      (QueryBuilder as jest.Mock).mockImplementation(() => mockQueryBuilderInstance);

      const result = await getAllCategoriesFromDB({});

      expect(QueryBuilder).toHaveBeenCalled();
      expect(result.result).toBe(mockResult);
      expect(result.meta).toBe(mockMeta);
    });
  });
});
