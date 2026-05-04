import prisma from '../../config/prisma';
import { getRestockQueueFromDB } from '../restock.service';

// Mock dependencies
jest.mock('../../config/prisma', () => ({
  __esModule: true,
  default: {
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('Restock Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRestockQueueFromDB', () => {
    it('should return products that require restocking with correct priority', async () => {
      const mockProducts = [
        { id: 'p1', name: 'Product 1', stock_quantity: 0, min_threshold: 10 },
        { id: 'p2', name: 'Product 2', stock_quantity: 2, min_threshold: 10 },
        { id: 'p3', name: 'Product 3', stock_quantity: 8, min_threshold: 10 },
      ];
      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (prisma.product.count as jest.Mock).mockResolvedValue(3);

      const result = await getRestockQueueFromDB({});

      expect(prisma.product.findMany).toHaveBeenCalled();
      expect(result.result[0]!.priority).toBe('High');
      expect(result.result[1]!.priority).toBe('Medium');
      expect(result.result[2]!.priority).toBe('Low');
    });
  });
});
