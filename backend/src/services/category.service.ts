import QueryBuilder from '../builders/QueryBuilder';
import Category, { ICategoryDocument } from '../models/category.model';
import ActivityLog from '../models/activity-log.model';
import { CreateCategoryInput } from '../validators/category.validator';
import { Types } from 'mongoose';

// ─── POST /api/category (Permissions: Admin, Manager) ────────────────────────
export const createCategoryIntoDB = async (
  userId: Types.ObjectId,
  payload: CreateCategoryInput,
) => {
  const result = await Category.create(payload);

  if (result) {
    await ActivityLog.create({
      action_text: `New category created: ${result.name}`,
      user_id: userId,
      timestamp: new Date(),
    });
  }

  return result;
};

// ─── GET /api/category (Permissions: Admin, Manager) ─────────────────────────
export const getAllCategoriesFromDB = async (query: Record<string, unknown>) => {
  const searchableFields = ['name'];

  const categoryQuery = new QueryBuilder<ICategoryDocument>(Category.find(), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await categoryQuery.modelQuery;
  const meta = await categoryQuery.countTotal();

  return {
    meta,
    result,
  };
};
