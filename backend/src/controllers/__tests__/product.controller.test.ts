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
      user: { id: 'user123', role: 'Admin' },
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
      const mockResult = { id: 'prod123', ...req.body };
      (productService.createProductIntoDB as jest.Mock).mockResolvedValue(mockResult);

      await createProduct(req as Request, res as Response, next);

      expect(productService.createProductIntoDB).toHaveBeenCalledWith(req, 'user123', req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockResult,
        }),
      );
    });
  });

  describe('getProducts', () => {
    it('should return 200 and a list of products', async () => {
      req.query = { page: '1' };
      const mockResult = { meta: { total: 1 }, result: [{ name: 'P1' }] };
      (productService.getAllProductsFromDB as jest.Mock).mockResolvedValue(mockResult);

      await getProducts(req as Request, res as Response, next);

      expect(productService.getAllProductsFromDB).toHaveBeenCalledWith(req.query);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateProduct', () => {
    it('should return 200 and updated product', async () => {
      req.params = { id: 'prod123' };
      req.body = { name: 'P1 Updated' };
      const mockResult = { id: 'prod123', ...req.body };
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
    });
  });

  describe('deleteProduct', () => {
    it('should return 200 on success', async () => {
      req.params = { id: 'prod123' };
      (productService.deleteProductFromDB as jest.Mock).mockResolvedValue({ id: 'prod123' });

      await deleteProduct(req as Request, res as Response, next);

      expect(productService.deleteProductFromDB).toHaveBeenCalledWith(
        req,
        'user123',
        'Admin',
        'prod123',
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
