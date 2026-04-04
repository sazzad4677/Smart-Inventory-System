import Category from '../models/category.model';
import ActivityLog from '../models/activity-log.model';
import { CreateCategoryInput } from '../validators/category.validator';
import { Types } from 'mongoose';

// ─── Create Category Into DB ───────────────────────────────────────────────
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

// ─── Get All Categories From DB ──────────────────────────────────────────────
export const getAllCategoriesFromDB = async () => {
  const result = await Category.find().sort({ name: 1 });
  return result;
};
