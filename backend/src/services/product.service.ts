import { Prisma, ProductStatus } from '@prisma/client';
import prisma from '../config/prisma';
import { CreateProductInput, UpdateProductInput } from '../validators/product.validator';
import { generateNextId } from '../utils/id.utils';
import { AppError } from '../utils/AppError';
import { captureActivity } from '../utils/activity-logger';
import { ActivityType } from '../types';
import { Request } from 'express';

export const createProductIntoDB = async (
  req: Request,
  userId: string,
  payload: CreateProductInput,
) => {
  const categoryExists = await prisma.category.findUnique({
    where: { id: payload.category_id },
  });
  if (!categoryExists) {
    throw new AppError('The specified category does not exist.', 400);
  }

  const product_id = await generateNextId('product_id', 'PRD');
  const result = await prisma.product.create({
    data: {
      ...payload,
      product_id,
      created_by: userId,
      // Automatically set status and restock flags based on initial stock
      status: payload.stock_quantity <= 0 ? ProductStatus.OutOfStock : ProductStatus.Active,
      is_restock_required: payload.stock_quantity <= payload.min_threshold,
    },
  });

  if (result) {
    await captureActivity(req, {
      type: ActivityType.CREATE,
      resource: 'PRODUCT',
      resourceId: result.id,
      action_text: `New product created: ${result.name}`,
      details: {
        product_id: result.product_id,
        name: result.name,
        category: categoryExists.name,
        initial_stock: result.stock_quantity,
      },
      userId,
    });
  }

  return result;
};

export const getAllProductsFromDB = async (query: Record<string, unknown>) => {
  const { searchTerm, page = 1, limit = 20, sort, ...filters } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: Prisma.ProductWhereInput = {
    is_deleted: false,
    ...(filters as any),
  };

  if (searchTerm) {
    where.OR = [
      { name: { contains: searchTerm as string, mode: 'insensitive' } },
      { product_id: { contains: searchTerm as string, mode: 'insensitive' } },
    ];
  }

  const result = await prisma.product.findMany({
    where,
    skip,
    take,
    include: {
      category: true,
    },
    orderBy: sort ? { [sort as string]: 'asc' } : { createdAt: 'desc' },
  });

  const total = await prisma.product.count({ where });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / take),
    },
    result,
  };
};

export const getProductByIdFromDB = async (id: string) => {
  return await prisma.product.findUnique({
    where: { id, is_deleted: false },
    include: { category: true },
  });
};

export const updateProductInDB = async (
  req: Request,
  userId: string,
  userRole: string,
  id: string,
  payload: UpdateProductInput,
) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });
  if (!product) throw new AppError('Product not found', 404);

  // Permission Logic: Staff can only update products they created, unless it's a simple stock update
  if (userRole === 'Staff') {
    const isRestockOnly = Object.keys(payload).length === 1 && payload.stock_quantity !== undefined;
    const isCreator = product.created_by === userId;

    if (!isRestockOnly && !isCreator) {
      throw new AppError('Staff can only update products they created.', 403);
    }
  }

  // Filter out undefined values to satisfy exactOptionalPropertyTypes: true
  const data: Prisma.ProductUpdateInput = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined),
  );

  // Recalculate status and restock flags if stock or threshold changes
  if (payload.stock_quantity !== undefined) {
    data.status = payload.stock_quantity <= 0 ? ProductStatus.OutOfStock : ProductStatus.Active;
    const minThreshold =
      payload.min_threshold !== undefined ? payload.min_threshold : product.min_threshold;
    data.is_restock_required = payload.stock_quantity <= minThreshold;
  } else if (payload.min_threshold !== undefined) {
    data.is_restock_required = product.stock_quantity <= payload.min_threshold;
  }

  const result = await prisma.product.update({
    where: { id },
    data,
  });

  if (result) {
    const diff: Record<string, { old: unknown; new: unknown }> = {};
    Object.keys(payload).forEach((key) => {
      const k = key as keyof UpdateProductInput;
      if (product[k] !== payload[k]) {
        diff[k] = { old: product[k], new: payload[k] };
      }
    });

    let type: ActivityType = ActivityType.UPDATE;
    let actionText = `Product updated: ${result.name}`;

    if (payload.stock_quantity !== undefined) {
      type = ActivityType.RESTOCK;
      actionText = `Stock updated for ${result.name} to ${result.stock_quantity}`;
    }

    await captureActivity(req, {
      type,
      resource: 'PRODUCT',
      resourceId: result.id,
      action_text: actionText,
      details: {
        product_id: result.product_id,
        name: result.name,
        changes: diff,
      },
      userId,
    });
  }

  return result;
};

export const deleteProductFromDB = async (
  req: Request,
  userId: string,
  userRole: string,
  id: string,
) => {
  if (userRole === 'Staff') {
    throw new AppError('Staff are not allowed to delete products.', 403);
  }

  // Prevent deletion if product is linked to existing orders
  const hasOrders = await prisma.orderItem.findFirst({
    where: { product_id: id },
  });
  if (hasOrders) {
    throw new AppError('Cannot delete product that has been ordered.', 400);
  }

  const result = await prisma.product.update({
    where: { id },
    data: { is_deleted: true },
  });

  if (result) {
    await captureActivity(req, {
      type: ActivityType.DELETE,
      resource: 'PRODUCT',
      resourceId: result.id,
      action_text: `Product deleted: ${result.name}`,
      details: {
        product_id: result.product_id,
        name: result.name,
      },
      userId,
    });
  }

  return result;
};

export const bulkDeleteProductsFromDB = async (req: Request, userId: string, ids: string[]) => {
  // Filter out products that have orders to prevent relational integrity issues
  const itemsWithOrders = await prisma.orderItem.findMany({
    where: { product_id: { in: ids } },
    select: { product_id: true },
  });
  const productIdsWithOrders = new Set(itemsWithOrders.map((item) => item.product_id));
  const idsToDelete = ids.filter((id) => !productIdsWithOrders.has(id));

  if (idsToDelete.length === 0 && ids.length > 0) {
    throw new AppError(
      'None of the selected products can be deleted as they are linked to orders.',
      400,
    );
  }

  const result = await prisma.product.updateMany({
    where: { id: { in: idsToDelete } },
    data: { is_deleted: true },
  });

  if (result.count > 0) {
    await captureActivity(req, {
      type: ActivityType.DELETE,
      resource: 'PRODUCT',
      action_text: `Bulk deleted ${result.count} products`,
      details: {
        product_ids: ids,
        count: result.count,
      },
      userId,
    });
  }

  return result;
};
