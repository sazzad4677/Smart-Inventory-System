import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import {
  createProductIntoDB,
  getAllProductsFromDB,
  updateProductInDB,
} from '../services/product.service';
import type { CreateProductInput, UpdateProductInput } from '../validators/product.validator';

// ─── POST /api/products ───────────────────────────────────────────────────
export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await createProductIntoDB(req.body as CreateProductInput);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Product created successfully.',
    data: result,
  });
});

// ─── GET /api/products ────────────────────────────────────────────────────
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

// ─── PUT /api/products/:id ────────────────────────────────────────────────
export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await updateProductInDB(id as string, req.body as UpdateProductInput);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product updated successfully.',
    data: result,
  });
});
