import Category from '../models/category.model';
import { CreateCategoryInput } from '../validators/category.validator';

// ─── Create Category Into DB ───────────────────────────────────────────────
export const createCategoryIntoDB = async (payload: CreateCategoryInput) => {
  const result = await Category.create(payload);
  return result;
};

// ─── Get All Categories From DB ──────────────────────────────────────────────
export const getAllCategoriesFromDB = async () => {
  const result = await Category.find().sort({ name: 1 });
  return result;
};
