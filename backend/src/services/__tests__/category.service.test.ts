import prisma from '../../config/prisma';
import { createCategoryIntoDB, getAllCategoriesFromDB } from '../category.service';

// Mock dependencies
jest.mock('../../config/prisma', () => ({
  __esModule: true,
  default: {
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('../../utils/activity-logger');

describe('Category Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategoryIntoDB', () => {
    it('should successfully create a category', async () => {
      const payload = { name: 'Electronics' };
      const req = { user: { id: 'user1' } };
      (prisma.category.create as jest.Mock).mockResolvedValue({ id: 'cat1', name: 'Electronics' });

      const result = await createCategoryIntoDB(req as any, 'user1', payload);

      expect(prisma.category.create).toHaveBeenCalled();
      expect(result.name).toBe('Electronics');
    });
  });

  describe('getAllCategoriesFromDB', () => {
    it('should return categories and meta', async () => {
      const mockCategories = [{ id: 'cat1', name: 'Electronics' }];
      (prisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories);
      (prisma.category.count as jest.Mock).mockResolvedValue(1);

      const result = await getAllCategoriesFromDB({});

      expect(prisma.category.findMany).toHaveBeenCalled();
      expect(result.result).toEqual(mockCategories);
      expect(result.meta.total).toBe(1);
    });
  });
});
