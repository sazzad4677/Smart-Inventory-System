import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import {
  createProductIntoDB,
  getAllProductsFromDB,
  updateProductInDB,
  getProductByIdFromDB,
} from '../services/product.service';
import type { CreateProductInput, UpdateProductInput } from '../validators/product.validator';

// ─── POST /api/product (Permissions: Admin Only) ─────────────────────────────
export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  const result = await createProductIntoDB(userId, req.body as CreateProductInput);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Product created successfully.',
    data: result,
  });
});

// ─── GET /api/product (Permissions: Admin, Manager) ──────────────────────────
export const getProducts = catchAsync(async (req: Request, res: Response) => {
  const { meta, result } = await getAllProductsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Products fetched successfully.',
    meta: meta,
    data: result,
  });
});

// ─── GET /api/product/:id (Permissions: Admin, Manager) ──────────────────────
export const getProductById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await getProductByIdFromDB(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product fetched successfully.',
    data: result,
  });
});

// ─── PUT /api/product/:id (Permissions: Admin, Manager) ──────────────────────
export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?._id;
  const result = await updateProductInDB(userId, id as string, req.body as UpdateProductInput);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product updated successfully.',
    data: result,
  });
});
