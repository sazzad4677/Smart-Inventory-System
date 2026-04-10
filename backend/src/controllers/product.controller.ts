import { Request, Response } from 'express';
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

// ─── POST /api/product (Permissions: Admin Only) ─────────────────────────────
export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  const result = await createProductIntoDB(req, userId, req.body as CreateProductInput);

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
  const userRole = (req as any).user?.role;
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
export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?._id;
  const userRole = (req as any).user?.role;
  const result = await deleteProductFromDB(req, userId, userRole, id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product deleted successfully.',
    data: result,
  });
});

// ─── DELETE /api/product/bulk (Permissions: Admin) ──────────────────────────
export const bulkDeleteProducts = catchAsync(async (req: Request, res: Response) => {
  const { ids } = req.body;
  const userId = (req as any).user?._id;
  const result = await bulkDeleteProductsFromDB(req, userId, ids as string[]);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Products deleted successfully.',
    data: result,
  });
});
