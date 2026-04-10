import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
} from '../product.controller';
import * as productService from '../../services/product.service';
import { Request, Response } from 'express';

// Mock product service
jest.mock('../../services/product.service');

describe('Product Controller', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {},
      query: {},
      user: { _id: 'user123', role: 'Admin' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('createProduct', () => {
    it('should return 201 and the created product on success', async () => {
      req.body = { name: 'Product 1', price: 100 };
      const mockResult = { _id: 'prod123', ...req.body };
      (productService.createProductIntoDB as jest.Mock).mockResolvedValue(mockResult);

      await createProduct(req as Request, res as Response, next);

      expect(productService.createProductIntoDB).toHaveBeenCalledWith(req, 'user123', req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product created successfully.',
        data: mockResult,
      });
    });

    it('should call next(error) if the service throws an error', async () => {
      const error = new Error('Service Error');
      (productService.createProductIntoDB as jest.Mock).mockRejectedValue(error);

      await createProduct(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getProducts', () => {
    it('should return 200 and a list of products on success', async () => {
      req.query = { page: '1' };
      const mockResult = { meta: { total: 1 }, result: [{ name: 'P1' }] };
      (productService.getAllProductsFromDB as jest.Mock).mockResolvedValue(mockResult);

      await getProducts(req as Request, res as Response, next);

      expect(productService.getAllProductsFromDB).toHaveBeenCalledWith(req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Products fetched successfully.',
        meta: mockResult.meta,
        data: mockResult.result,
      });
    });

    it('should call next(error) if the service throws an error', async () => {
      const error = new Error('Service Error');
      (productService.getAllProductsFromDB as jest.Mock).mockRejectedValue(error);

      await getProducts(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getProductById', () => {
    it('should return 200 and the product on success', async () => {
      req.params = { id: 'prod123' };
      const mockResult = { _id: 'prod123', name: 'P1' };
      (productService.getProductByIdFromDB as jest.Mock).mockResolvedValue(mockResult);

      await getProductById(req as Request, res as Response, next);

      expect(productService.getProductByIdFromDB).toHaveBeenCalledWith('prod123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product fetched successfully.',
        data: mockResult,
      });
    });

    it('should call next(error) if the service throws an error', async () => {
      const error = new Error('Service Error');
      (productService.getProductByIdFromDB as jest.Mock).mockRejectedValue(error);

      await getProductById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateProduct', () => {
    it('should return 200 and the updated product on success', async () => {
      req.params = { id: 'prod123' };
      req.body = { name: 'P1 Updated' };
      const mockResult = { _id: 'prod123', ...req.body };
      (productService.updateProductInDB as jest.Mock).mockResolvedValue(mockResult);

      await updateProduct(req as Request, res as Response, next);

      expect(productService.updateProductInDB).toHaveBeenCalledWith(
        req,
        'user123',
        'Admin',
        'prod123',
        req.body,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product updated successfully.',
        data: mockResult,
      });
    });

    it('should call next(error) if the service throws an error', async () => {
      const error = new Error('Service Error');
      (productService.updateProductInDB as jest.Mock).mockRejectedValue(error);

      await updateProduct(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteProduct', () => {
    it('should return 200 and success message on success', async () => {
      req.params = { id: 'prod123' };
      (productService.deleteProductFromDB as jest.Mock).mockResolvedValue({ _id: 'prod123' });

      await deleteProduct(req as Request, res as Response, next);

      expect(productService.deleteProductFromDB).toHaveBeenCalledWith(
        req,
        'user123',
        'Admin',
        'prod123',
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product deleted successfully.',
        data: { _id: 'prod123' },
      });
    });

    it('should call next(error) if service fails', async () => {
      const error = new Error('Fail');
      (productService.deleteProductFromDB as jest.Mock).mockRejectedValue(error);
      await deleteProduct(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('bulkDeleteProducts', () => {
    it('should return 200 and success message on success', async () => {
      req.body = { ids: ['p1', 'p2'] };
      (productService.bulkDeleteProductsFromDB as jest.Mock).mockResolvedValue({
        modifiedCount: 2,
      });

      await bulkDeleteProducts(req as Request, res as Response, next);

      expect(productService.bulkDeleteProductsFromDB).toHaveBeenCalledWith(req, 'user123', [
        'p1',
        'p2',
      ]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Products deleted successfully.',
        data: { modifiedCount: 2 },
      });
    });

    it('should call next(error) if service fails', async () => {
      const error = new Error('Fail');
      (productService.bulkDeleteProductsFromDB as jest.Mock).mockRejectedValue(error);
      await bulkDeleteProducts(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
