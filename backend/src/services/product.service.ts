import QueryBuilder from '../builders/QueryBuilder';
import Product, { IProductDocument } from '../models/product.model';
import ActivityLog from '../models/activity-log.model';
import { CreateProductInput, UpdateProductInput } from '../validators/product.validator';
import { Types } from 'mongoose';
import { generateNextId } from '../utils/id.utils';

// ─── POST /api/product (Permissions: Admin Only) ─────────────────────────────
export const createProductIntoDB = async (userId: Types.ObjectId, payload: CreateProductInput) => {
  const product_id = await generateNextId('product_id', 'PRD');
  const result = await Product.create({ ...payload, product_id } as any);

  if (result) {
    await ActivityLog.create({
      action_text: `New product created: ${result.name}`,
      user_id: userId,
      timestamp: new Date(),
    });
  }

  return result;
};

// ─── GET /api/product (Permissions: Admin, Manager) ──────────────────────────
export const getAllProductsFromDB = async (query: Record<string, unknown>) => {
  const searchableFields = ['name', 'product_id']; // As per user request

  const productQuery = new QueryBuilder<IProductDocument>(
    Product.find().populate('category_id'),
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
  return await Product.findById(id).populate('category_id');
};

// ─── PUT /api/product/:id (Permissions: Admin, Manager) ──────────────────────
export const updateProductInDB = async (
  userId: Types.ObjectId,
  id: string,
  payload: UpdateProductInput,
) => {
  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (result) {
    let actionText = `Product updated: ${result.name}`;

    // Check if it was a restock (only stock_quantity updated or significantly changed)
    if (payload.stock_quantity !== undefined) {
      actionText = `Stock updated for ${result.name} to ${result.stock_quantity}`;
    }

    await ActivityLog.create({
      action_text: actionText,
      user_id: userId,
      timestamp: new Date(),
    });
  }

  return result;
};
