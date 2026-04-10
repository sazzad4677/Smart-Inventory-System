import QueryBuilder from '../builders/QueryBuilder';
import Category, { ICategoryDocument } from '../models/category.model';
import ActivityLog from '../models/activity-log.model';
import { CreateCategoryInput } from '../validators/category.validator';
import { Types } from 'mongoose';
import { captureActivity } from '../utils/activity-logger';
import { ActivityType } from '../types';
import { Request } from 'express';

// ─── POST /api/category (Permissions: Admin, Manager) ────────────────────────
export const createCategoryIntoDB = async (
  req: Request,
  userId: Types.ObjectId,
  payload: CreateCategoryInput,
) => {
  const result = await Category.create(payload);

  if (result) {
    await captureActivity(req, {
      type: ActivityType.Create,
      resource: 'CATEGORY',
      action_text: `New category created: ${result.name}`,
      userId: userId,
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
