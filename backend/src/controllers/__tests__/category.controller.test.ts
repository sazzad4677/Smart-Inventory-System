import { createCategory, getCategories } from '../category.controller';
import * as categoryService from '../../services/category.service';
import { Request, Response } from 'express';

// Mock category service
jest.mock('../../services/category.service');

describe('Category Controller', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      query: {},
      user: { id: 'user123' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('createCategory', () => {
    it('should return 201 and the created category', async () => {
      req.body = { name: 'Category 1' };
      const mockResult = { id: 'cat123', name: 'Category 1' };
      (categoryService.createCategoryIntoDB as jest.Mock).mockResolvedValue(mockResult);

      await createCategory(req as Request, res as Response, next);

      expect(categoryService.createCategoryIntoDB).toHaveBeenCalledWith(req, 'user123', req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockResult,
        }),
      );
    });
  });

  describe('getCategories', () => {
    it('should return 200 and a list of categories', async () => {
      const mockResult = { meta: { total: 1 }, result: [{ id: 'cat1', name: 'C1' }] };
      (categoryService.getAllCategoriesFromDB as jest.Mock).mockResolvedValue(mockResult);

      await getCategories(req as Request, res as Response, next);

      expect(categoryService.getAllCategoriesFromDB).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockResult.result,
          meta: mockResult.meta,
        }),
      );
    });
  });
});
