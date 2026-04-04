import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { createCategoryIntoDB, getAllCategoriesFromDB } from '../services/category.service';
import type { CreateCategoryInput } from '../validators/category.validator';

// ─── POST /api/categories ──────────────────────────────────────────────────
export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const result = await createCategoryIntoDB(userId, req.body as CreateCategoryInput);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Category created successfully.',
    data: result,
  });
});

// ─── GET /api/categories ───────────────────────────────────────────────────
export const getCategories = catchAsync(async (_req: Request, res: Response) => {
  const result = await getAllCategoriesFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Categories fetched successfully.',
    data: result,
  });
});
