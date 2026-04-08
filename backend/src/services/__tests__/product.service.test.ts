import { createProductIntoDB, getAllProductsFromDB, updateProductInDB } from '../product.service';
import Product from '../../models/product.model';
import ActivityLog from '../../models/activity-log.model';
import { generateNextId } from '../../utils/id.utils';
import { Types } from 'mongoose';
import QueryBuilder from '../../builders/QueryBuilder';

// Mock dependencies
jest.mock('../../models/product.model');
jest.mock('../../models/activity-log.model');
jest.mock('../../utils/id.utils');
jest.mock('../../builders/QueryBuilder');

describe('Product Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProductIntoDB', () => {
    it('should successfully create a product and log the activity', async () => {
      const userId = new Types.ObjectId();
      const payload = { name: 'New Product', price: 100 } as any;
      (generateNextId as jest.Mock).mockResolvedValue('PRD-001');
      (Product.create as jest.Mock).mockResolvedValue({ _id: 'prod123', name: 'New Product' });
      (ActivityLog.create as jest.Mock).mockResolvedValue({});

      const result = await createProductIntoDB(userId, payload);

      expect(generateNextId).toHaveBeenCalledWith('product_id', 'PRD');
      expect(Product.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Product', product_id: 'PRD-001' }),
      );
      expect(ActivityLog.create).toHaveBeenCalled();
      expect(result.name).toBe('New Product');
    });
  });

  describe('getAllProductsFromDB', () => {
    it('should return products and meta using QueryBuilder', async () => {
      const query = { page: '1' };
      const mockResult = [{ name: 'P1' }];
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

      (Product.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({}),
      });

      (QueryBuilder as jest.Mock).mockImplementation(() => mockQueryBuilderInstance);

      const result = await getAllProductsFromDB(query);

      expect(QueryBuilder).toHaveBeenCalled();
      expect(result.result).toEqual(mockResult);
      expect(result.meta).toEqual(mockMeta);
    });
  });

  describe('updateProductInDB', () => {
    it('should successfully update a product and log the activity', async () => {
      const userId = new Types.ObjectId();
      const productId = 'prod123';
      const payload = { stock_quantity: 50 };
      const mockProduct = {
        _id: productId,
        name: 'Product A',
        stock_quantity: 10,
        save: jest
          .fn()
          .mockResolvedValue({ _id: productId, name: 'Product A', stock_quantity: 50 }),
      };
      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);
      (ActivityLog.create as jest.Mock).mockResolvedValue({});

      const result = await updateProductInDB(userId, productId, payload as any);

      expect(Product.findById).toHaveBeenCalledWith(productId);
      expect(mockProduct.save).toHaveBeenCalled();
      expect(ActivityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action_text: expect.stringContaining('Stock updated'),
          user_id: userId,
        }),
      );
      expect(result.stock_quantity).toBe(50);
    });

    it('should throw "Product not found" if product does not exist', async () => {
      (Product.findById as jest.Mock).mockResolvedValue(null);
      await expect(
        updateProductInDB(new Types.ObjectId(), 'invalid_id', {} as any),
      ).rejects.toThrow('Product not found');
    });
  });
});
