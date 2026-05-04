import prisma from '../../config/prisma';
import {
  createProductIntoDB,
  getAllProductsFromDB,
  updateProductInDB,
  getProductByIdFromDB,
  deleteProductFromDB,
  bulkDeleteProductsFromDB,
} from '../product.service';
import { generateNextId } from '../../utils/id.utils';
import { ProductStatus } from '../../types';
import { AppError } from '../../utils/AppError';

// Mock dependencies
jest.mock('../../config/prisma', () => ({
  __esModule: true,
  default: {
    product: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    orderItem: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    activityLog: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../../utils/id.utils');
jest.mock('../../utils/activity-logger');

describe('Product Service', () => {
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

  describe('createProductIntoDB', () => {
    it('should successfully create a product and log the activity', async () => {
      const userId = 'user123';
      const payload = {
        name: 'New Product',
        price: 100,
        category_id: 'cat123',
        stock_quantity: 10,
        min_threshold: 5,
      } as any;
      (prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: 'cat123', name: 'Cat' });
      (generateNextId as jest.Mock).mockResolvedValue('PRD-001');
      (prisma.product.create as jest.Mock).mockResolvedValue({
        id: 'prod123',
        name: 'New Product',
        product_id: 'PRD-001',
      });

      const result = await createProductIntoDB(req, userId, payload);

      expect(generateNextId).toHaveBeenCalledWith('product_id', 'PRD');
      expect(prisma.product.create).toHaveBeenCalled();
      expect(result.name).toBe('New Product');
    });

    it('should throw error if category does not exist', async () => {
      (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        createProductIntoDB(req, 'u1', { category_id: 'invalid' } as any),
      ).rejects.toThrow(new AppError('The specified category does not exist.', 400));
    });
  });

  describe('getAllProductsFromDB', () => {
    it('should return products and meta', async () => {
      const query = { page: '1' };
      const mockResult = [{ name: 'P1' }];
      const mockTotal = 1;

      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockResult);
      (prisma.product.count as jest.Mock).mockResolvedValue(mockTotal);

      const result = await getAllProductsFromDB(query);

      expect(prisma.product.findMany).toHaveBeenCalled();
      expect(result.result).toEqual(mockResult);
      expect(result.meta.total).toBe(mockTotal);
    });
  });

  describe('updateProductInDB', () => {
    it('should successfully update a product and log the activity', async () => {
      const userId = 'user123';
      const productId = 'prod123';
      const payload = { stock_quantity: 50 };
      const mockProduct = {
        id: productId,
        name: 'Product A',
        stock_quantity: 10,
        min_threshold: 5,
        created_by: userId,
      };
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.product.update as jest.Mock).mockResolvedValue({
        ...mockProduct,
        stock_quantity: 50,
      });

      const result = await updateProductInDB(req, userId, 'Admin', productId, payload as any);

      expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: productId } });
      expect(prisma.product.update).toHaveBeenCalled();
      expect(result.stock_quantity).toBe(50);
    });

    it('should throw "Product not found" if product does not exist', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(updateProductInDB(req, 'u1', 'Admin', 'invalid_id', {} as any)).rejects.toThrow(
        'Product not found',
      );
    });
  });

  describe('getProductByIdFromDB', () => {
    it('should fetch a single product', async () => {
      const productId = 'prod123';
      (prisma.product.findUnique as jest.Mock).mockResolvedValue({
        id: productId,
        name: 'Product A',
      });

      const result = await getProductByIdFromDB(productId);

      expect(prisma.product.findUnique).toHaveBeenCalled();
      expect(result?.name).toBe('Product A');
    });
  });

  describe('deleteProductFromDB', () => {
    it('should soft delete a product and log activity', async () => {
      const userId = 'user123';
      const productId = 'prod123';
      (prisma.orderItem.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.product.update as jest.Mock).mockResolvedValue({
        id: productId,
        name: 'Deleted P',
        is_deleted: true,
      });

      const result = await deleteProductFromDB(req, userId, 'Admin', productId);

      expect(prisma.orderItem.findFirst).toHaveBeenCalledWith({ where: { product_id: productId } });
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { is_deleted: true },
      });
      expect(result?.name).toBe('Deleted P');
    });

    it('should throw error if product has orders', async () => {
      const userId = 'user123';
      const productId = 'prod123';
      (prisma.orderItem.findFirst as jest.Mock).mockResolvedValue({ id: 'item1' });

      await expect(deleteProductFromDB(req, userId, 'Admin', productId)).rejects.toThrow(
        'Cannot delete product that has been ordered.',
      );
    });
  });

  describe('bulkDeleteProductsFromDB', () => {
    it('should bulk soft delete products and log activity', async () => {
      const userId = 'user123';
      const ids = ['p1', 'p2'];
      (prisma.orderItem.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.product.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await bulkDeleteProductsFromDB(req, userId, ids);

      expect(prisma.product.updateMany).toHaveBeenCalled();
      expect(result.count).toBe(2);
    });

    it('should throw error if none of the products can be deleted due to orders', async () => {
      (prisma.orderItem.findMany as jest.Mock).mockResolvedValue([{ product_id: 'p1' }]);
      await expect(bulkDeleteProductsFromDB(req, 'u1', ['p1'])).rejects.toThrow(
        new AppError(
          'None of the selected products can be deleted as they are linked to orders.',
          400,
        ),
      );
    });
  });

  describe('Product Service - Additional Branch Coverage', () => {
    it('should filter products by searchTerm', async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.product.count as jest.Mock).mockResolvedValue(0);
      await getAllProductsFromDB({ searchTerm: 'test' });
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ OR: expect.any(Array) }),
        }),
      );
    });

    it('should throw 403 if Staff tries to update product they did not create', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue({ created_by: 'admin1' });
      await expect(
        updateProductInDB(req, 'staff1', 'Staff', 'p1', { name: 'New' } as any),
      ).rejects.toThrow(new AppError('Staff can only update products they created.', 403));
    });

    it('should allow Staff to update stock only even if not creator', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue({
        created_by: 'admin1',
        min_threshold: 10,
      });
      (prisma.product.update as jest.Mock).mockResolvedValue({});
      await updateProductInDB(req, 'staff1', 'Staff', 'p1', { stock_quantity: 20 } as any);
      expect(prisma.product.update).toHaveBeenCalled();
    });

    it('should throw 403 if Staff tries to delete a product', async () => {
      await expect(deleteProductFromDB(req, 'u1', 'Staff', 'p1')).rejects.toThrow(
        new AppError('Staff are not allowed to delete products.', 403),
      );
    });

    it('should update is_restock_required when only min_threshold is changed', async () => {
      (prisma.product.findUnique as jest.Mock).mockResolvedValue({
        stock_quantity: 5,
        min_threshold: 10,
      });
      (prisma.product.update as jest.Mock).mockResolvedValue({});
      await updateProductInDB(req, 'u1', 'Admin', 'p1', { min_threshold: 2 } as any);
      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ is_restock_required: false }),
        }),
      );
    });
  });
});
