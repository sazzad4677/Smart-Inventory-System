import QueryBuilder from '../builders/QueryBuilder';
import Product, { IProductDocument } from '../models/product.model';
import Category from '../models/category.model';
import OrderItem from '../models/order-item.model';
import { CreateProductInput, UpdateProductInput } from '../validators/product.validator';
import { Types } from 'mongoose';
import { generateNextId } from '../utils/id.utils';
import { AppError } from '../utils/AppError';
import { captureActivity } from '../utils/activity-logger';
import { ActivityType } from '../types';
import { Request } from 'express';

// ─── POST /api/product (Permissions: Admin Only) ─────────────────────────────
export const createProductIntoDB = async (
  req: Request,
  userId: Types.ObjectId,
  payload: CreateProductInput,
) => {
  // Verify category exists
  const categoryExists = await Category.findById(payload.category_id);
  if (!categoryExists) {
    throw new AppError('The specified category does not exist.', 400);
  }

  const product_id = await generateNextId('product_id', 'PRD');
  const result = await Product.create({ ...payload, product_id, created_by: userId } as any);

  if (result) {
    await captureActivity(req, {
      type: ActivityType.Create,
      resource: 'PRODUCT',
      resourceId: result._id.toString(),
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

// ─── GET /api/product (Permissions: Admin, Manager) ──────────────────────────
export const getAllProductsFromDB = async (query: Record<string, unknown>) => {
  const searchableFields = ['name', 'product_id'];

  const productQuery = new QueryBuilder<IProductDocument>(
    Product.find({ is_deleted: { $ne: true } }).populate('category_id'),
    query,
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();

  return {
    meta,
    result,
  };
};

// ─── GET /api/product/:id (Permissions: Admin, Manager) ──────────────────────
export const getProductByIdFromDB = async (id: string) => {
  return await Product.findOne({ _id: id, is_deleted: { $ne: true } }).populate('category_id');
};

// ─── PUT /api/product/:id (Permissions: Admin, Manager) ──────────────────────
export const updateProductInDB = async (
  req: Request,
  userId: Types.ObjectId,
  userRole: string,
  id: string,
  payload: UpdateProductInput,
) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Product not found', 404);

  // Capture old product state for diffing
  const oldProduct: Record<string, any> = product.toObject();

  // Staff permission logic
  if (userRole === 'Staff') {
    const isRestockOnly = Object.keys(payload).length === 1 && payload.stock_quantity !== undefined;
    const isCreator = product.created_by && product.created_by.toString() === userId.toString();

    if (!isRestockOnly && !isCreator) {
      throw new AppError('Staff can only update products they created.', 403);
    }
  }

  Object.assign(product, payload);
  const result = await product.save();

  if (result) {
    // Generate diff
    const diff: Record<string, any> = {};
    Object.keys(payload).forEach((key) => {
      const k = key as keyof UpdateProductInput;
      if (oldProduct[k] !== payload[k]) {
        diff[k] = { old: oldProduct[k], new: payload[k] };
      }
    });

    let type = ActivityType.Update;
    let actionText = `Product updated: ${result.name}`;

    if (payload.stock_quantity !== undefined) {
      type = ActivityType.Restock;
      actionText = `Stock updated for ${result.name} to ${result.stock_quantity}`;
    }

    await captureActivity(req, {
      type,
      resource: 'PRODUCT',
      resourceId: result._id.toString(),
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

// ─── DELETE /api/product/:id (Permissions: Admin, Manager) ──────────────────
export const deleteProductFromDB = async (
  req: Request,
  userId: Types.ObjectId,
  userRole: string,
  id: string,
) => {
  if (userRole === 'Staff') {
    throw new AppError('Staff are not allowed to delete products.', 403);
  }

  // Protection: Check if product has been ordered
  const hasOrders = await OrderItem.exists({ product_id: id });
  if (hasOrders) {
    throw new AppError('Cannot delete product that has been ordered.', 400);
  }

  const result = await Product.findByIdAndUpdate(id, { is_deleted: true }, { new: true });

  if (result) {
    await captureActivity(req, {
      type: ActivityType.Delete,
      resource: 'PRODUCT',
      resourceId: result._id.toString(),
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

// ─── DELETE /api/product/bulk (Permissions: Admin) ──────────────────────────
export const bulkDeleteProductsFromDB = async (
  req: Request,
  userId: Types.ObjectId,
  ids: string[],
) => {
  // Protection: Filter out products that have orders
  const productsWithOrders = await OrderItem.find({ product_id: { $in: ids } }).distinct(
    'product_id',
  );
  const idsToDelete = ids.filter((id) => !productsWithOrders.some((pId) => pId.toString() === id));

  if (idsToDelete.length === 0 && ids.length > 0) {
    throw new AppError(
      'None of the selected products can be deleted as they are linked to orders.',
      400,
    );
  }

  const result = await Product.updateMany({ _id: { $in: idsToDelete } }, { is_deleted: true });

  if (result.modifiedCount > 0) {
    await captureActivity(req, {
      type: ActivityType.Delete,
      resource: 'PRODUCT',
      action_text: `Bulk deleted ${result.modifiedCount} products`,
      details: {
        product_ids: ids,
        count: result.modifiedCount,
      },
      userId,
    });
  }

  return result;
};
