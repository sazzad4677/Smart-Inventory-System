import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { CreateCategoryInput } from '../validators/category.validator';
import { captureActivity } from '../utils/activity-logger';
import { ActivityType, AuthenticatedRequest } from '../types';

// ─── POST /api/category (Permissions: Admin, Manager) ────────────────────────
export const createCategoryIntoDB = async (
  req: AuthenticatedRequest,
  userId: string,
  payload: CreateCategoryInput,
) => {
  const result = await prisma.category.create({
    data: {
      ...payload,
      created_by: userId,
    },
  });

  if (result) {
    await captureActivity(req, {
      type: ActivityType.CREATE,
      resource: 'CATEGORY',
      action_text: `New category created: ${result.name}`,
      userId: userId,
    });
  }

  return result;
};

// ─── GET /api/category (Permissions: Admin, Manager) ─────────────────────────
export const getAllCategoriesFromDB = async (query: Record<string, unknown>) => {
  const { searchTerm, page = 1, limit = 20, sort, fields, ...filters } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: Prisma.CategoryWhereInput = {
    ...(filters as any),
  };

  if (searchTerm) {
    where.OR = [{ name: { contains: searchTerm as string, mode: 'insensitive' } }];
  }

  const result = await prisma.category.findMany({
    where,
    skip,
    take,
    orderBy: sort ? { [sort as string]: 'asc' } : { createdAt: 'desc' },
  });

  const total = await prisma.category.count({ where });

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
