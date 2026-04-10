import {
  createProductIntoDB,
  getAllProductsFromDB,
  updateProductInDB,
  getProductByIdFromDB,
  deleteProductFromDB,
  bulkDeleteProductsFromDB,
} from '../product.service';
import Product from '../../models/product.model';
import Category from '../../models/category.model';
import OrderItem from '../../models/order-item.model';
import ActivityLog from '../../models/activity-log.model';
import { generateNextId } from '../../utils/id.utils';
import { Types } from 'mongoose';
import QueryBuilder from '../../builders/QueryBuilder';

// Mock dependencies
jest.mock('../../models/product.model');
jest.mock('../../models/category.model');
jest.mock('../../models/order-item.model');
jest.mock('../../models/activity-log.model');
jest.mock('../../utils/id.utils');
jest.mock('../../builders/QueryBuilder');

describe('Product Service', () => {
  let req: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      ip: '127.0.0.1',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
      get: jest.fn().mockReturnValue('mock-agent'),
      app: { get: jest.fn().mockReturnValue({ emit: jest.fn() }) },
    };
  });

  describe('createProductIntoDB', () => {
    it('should successfully create a product and log the activity', async () => {
      const userId = new Types.ObjectId();
      const payload = { name: 'New Product', price: 100 } as any;
      (Category.findById as jest.Mock).mockResolvedValue({ _id: 'cat123' });
      (generateNextId as jest.Mock).mockResolvedValue('PRD-001');
      (Product.create as jest.Mock).mockResolvedValue({ _id: 'prod123', name: 'New Product' });
      (ActivityLog.create as jest.Mock).mockResolvedValue({});

      const result = await createProductIntoDB(req, userId, payload);

      expect(generateNextId).toHaveBeenCalledWith('product_id', 'PRD');
      expect(Product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Product',
          product_id: 'PRD-001',
          created_by: userId,
        }),
      );
      expect(ActivityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          resource: 'PRODUCT',
          resource_id: 'prod123',
        }),
      );
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
        toObject: jest
          .fn()
          .mockReturnValue({ _id: productId, name: 'Product A', stock_quantity: 10 }),
        save: jest
          .fn()
          .mockResolvedValue({ _id: productId, name: 'Product A', stock_quantity: 50 }),
      };
      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);
      (ActivityLog.create as jest.Mock).mockResolvedValue({});

      const result = await updateProductInDB(req, userId, 'Admin', productId, payload as any);

      expect(Product.findById).toHaveBeenCalledWith(productId);
      expect(mockProduct.save).toHaveBeenCalled();
      expect(ActivityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action_text: expect.stringContaining('Stock updated'),
          user_id: userId,
          resource_id: productId,
        }),
      );
      expect(result.stock_quantity).toBe(50);
    });

    it('should throw "Product not found" if product does not exist', async () => {
      (Product.findById as jest.Mock).mockResolvedValue(null);
      await expect(
        updateProductInDB(req, new Types.ObjectId(), 'Admin', 'invalid_id', {} as any),
      ).rejects.toThrow('Product not found');
    });

    it('should throw error if Staff tries to update product they did not create', async () => {
      const userId = new Types.ObjectId();
      const productId = 'prod123';
      const mockProduct = {
        _id: productId,
        created_by: new Types.ObjectId(), // Different user
        toObject: jest.fn().mockReturnValue({ _id: productId }),
      };
      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);

      await expect(
        updateProductInDB(req, userId, 'Staff', productId, { name: 'New Name' } as any),
      ).rejects.toThrow('Staff can only update products they created.');
    });

    it('should allow Staff to update products they created', async () => {
      const userId = new Types.ObjectId();
      const productId = 'prod123';
      const mockProduct = {
        _id: productId,
        created_by: userId,
        toObject: jest.fn().mockReturnValue({ _id: productId }),
        save: jest.fn().mockResolvedValue({ _id: productId, name: 'New Name' }),
      };
      (Product.findById as jest.Mock).mockResolvedValue(mockProduct);
      (ActivityLog.create as jest.Mock).mockResolvedValue({});

      const result = await updateProductInDB(req, userId, 'Staff', productId, {
        name: 'New Name',
      } as any);
      expect(result.name).toBe('New Name');
    });
  });

  describe('getProductByIdFromDB', () => {
    it('should fetch a single product if not deleted', async () => {
      const productId = 'prod123';
      (Product.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: productId, name: 'Product A' }),
      });

      const result = await getProductByIdFromDB(productId);

      expect(Product.findOne).toHaveBeenCalledWith({ _id: productId, is_deleted: { $ne: true } });
      expect(result?.name).toBe('Product A');
    });
  });

  describe('deleteProductFromDB', () => {
    it('should soft delete a product and log activity', async () => {
      const userId = new Types.ObjectId();
      const productId = 'prod123';
      (OrderItem.exists as jest.Mock).mockResolvedValue(false);
      (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: productId,
        name: 'Deleted P',
      });
      (ActivityLog.create as jest.Mock).mockResolvedValue({});

      const result = await deleteProductFromDB(req, userId, 'Admin', productId);

      expect(OrderItem.exists).toHaveBeenCalledWith({ product_id: productId });
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        productId,
        { is_deleted: true },
        { new: true },
      );
      expect(ActivityLog.create).toHaveBeenCalled();
      expect(result?.name).toBe('Deleted P');
    });

    it('should throw error if Staff tries to delete a product', async () => {
      const userId = new Types.ObjectId();
      await expect(deleteProductFromDB(req, userId, 'Staff', 'prod123')).rejects.toThrow(
        'Staff are not allowed to delete products.',
      );
    });

    it('should throw error if product has orders', async () => {
      const userId = new Types.ObjectId();
      const productId = 'prod123';
      (OrderItem.exists as jest.Mock).mockResolvedValue(true);

      await expect(deleteProductFromDB(req, userId, 'Admin', productId)).rejects.toThrow(
        'Cannot delete product that has been ordered.',
      );
    });
  });

  describe('bulkDeleteProductsFromDB', () => {
    it('should bulk soft delete products and log activity', async () => {
      const userId = new Types.ObjectId();
      const ids = ['p1', 'p2'];
      (OrderItem.find as jest.Mock).mockReturnValue({
        distinct: jest.fn().mockResolvedValue([]),
      });
      (Product.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 2 });
      (ActivityLog.create as jest.Mock).mockResolvedValue({});

      const result = await bulkDeleteProductsFromDB(req, userId, ids);

      expect(Product.updateMany).toHaveBeenCalledWith({ _id: { $in: ids } }, { is_deleted: true });
      expect(ActivityLog.create).toHaveBeenCalled();
      expect(result.modifiedCount).toBe(2);
    });

    it('should return 0 modifiedCount if no products were updated', async () => {
      const userId = new Types.ObjectId();
      (OrderItem.find as jest.Mock).mockReturnValue({
        distinct: jest.fn().mockResolvedValue([]),
      });
      (Product.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 0 });

      const result = await bulkDeleteProductsFromDB(req, userId, ['p1']);
      expect(result.modifiedCount).toBe(0);
      expect(ActivityLog.create).not.toHaveBeenCalled();
    });

    it('should only delete products without orders', async () => {
      const userId = new Types.ObjectId();
      const ids = ['p1', 'p2'];
      (OrderItem.find as jest.Mock).mockReturnValue({
        distinct: jest.fn().mockResolvedValue(['p1']), // p1 has orders
      });
      (Product.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 1 });
      (ActivityLog.create as jest.Mock).mockResolvedValue({});

      const result = await bulkDeleteProductsFromDB(req, userId, ids);

      expect(Product.updateMany).toHaveBeenCalledWith(
        { _id: { $in: ['p2'] } },
        { is_deleted: true },
      );
      expect(result.modifiedCount).toBe(1);
    });
  });
});
