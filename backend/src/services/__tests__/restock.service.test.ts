import { getRestockQueueFromDB } from '../restock.service';
import Product from '../../models/product.model';
import QueryBuilder from '../../builders/QueryBuilder';

// Mock models and QueryBuilder
jest.mock('../../models/product.model');
jest.mock('../../builders/QueryBuilder');

describe('Restock Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRestockQueueFromDB', () => {
    it('should return restock queue with correct priority levels', async () => {
      const mockProducts = [
        { _id: '1', name: 'P1', stock_quantity: 0, min_threshold: 10 },
        { _id: '2', name: 'P2', stock_quantity: 4, min_threshold: 10 },
        { _id: '3', name: 'P3', stock_quantity: 8, min_threshold: 10 },
      ];

      const mockQueryBuilderInstance = {
        search: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        paginate: jest.fn().mockReturnThis(),
        fields: jest.fn().mockReturnThis(),
        modelQuery: {
          lean: jest.fn().mockReturnThis(),
          // Use a function that returns the desired mockProducts
          exec: jest.fn().mockResolvedValue(mockProducts),
        },
        countTotal: jest.fn().mockResolvedValue({ total: 3 }),
      };

      // Adjusting to handle .lean()
      (mockQueryBuilderInstance.modelQuery.lean as jest.Mock).mockReturnValue(mockProducts);

      (QueryBuilder as jest.Mock).mockImplementation(() => mockQueryBuilderInstance);

      const result = await getRestockQueueFromDB({});

      expect(Product.find).toHaveBeenCalled();
      expect(result.result.length).toBe(3);
      expect(result.result?.[0]?.priority).toBe('High'); // 0 stock
      expect(result.result?.[1]?.priority).toBe('Medium'); // 4 stocks (<= 10/2)
      expect(result.result?.[2]?.priority).toBe('Low'); // 8 stocks (> 10/2)
    });
  });
});
