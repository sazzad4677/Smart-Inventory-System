import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import {
  createProductIntoDB,
  getAllProductsFromDB,
  updateProductInDB,
  getProductByIdFromDB,
  deleteProductFromDB,
  bulkDeleteProductsFromDB,
} from '../services/product.service';
import type { CreateProductInput, UpdateProductInput } from '../validators/product.validator';
import { AuthenticatedRequest } from '../types';

// ─── POST /api/product (Permissions: Admin Only) ─────────────────────────────
export const createProduct = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id as string;
  const result = await createProductIntoDB(req, userId, req.body as CreateProductInput);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Product created successfully.',
    data: result,
  });
});

// ─── GET /api/product (Permissions: Admin, Manager) ──────────────────────────
export const getProducts = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { meta, result } = await getAllProductsFromDB(req.query as Record<string, unknown>);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Products fetched successfully.',
    meta: meta,
    data: result,
  });
});

// ─── GET /api/product/:id (Permissions: Admin, Manager) ──────────────────────
export const getProductById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
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
export const updateProduct = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id as string;
  const userRole = req.user?.role as string;
  const result = await updateProductInDB(
    req,
    userId,
    userRole,
    id as string,
    req.body as UpdateProductInput,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product updated successfully.',
    data: result,
  });
});

// ─── DELETE /api/product/:id (Permissions: Admin, Manager) ──────────────────
export const deleteProduct = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id as string;
  const userRole = req.user?.role as string;
  const result = await deleteProductFromDB(req, userId, userRole, id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product deleted successfully.',
    data: result,
  });
});

// ─── DELETE /api/product/bulk (Permissions: Admin) ──────────────────────────
export const bulkDeleteProducts = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { ids } = req.body;
  const userId = req.user?.id as string;
  const result = await bulkDeleteProductsFromDB(req, userId, ids as string[]);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Products deleted successfully.',
    data: result,
  });
});
