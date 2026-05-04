import { Prisma, UserRole } from '@prisma/client';
import prisma from '../config/prisma';
import { AppError } from '../utils/AppError';
import { ActivityType } from '../types';

export const getAllActivityLogsFromDB = async (
  query: Record<string, unknown>,
  requestingUser?: { id: string; role: UserRole | string },
) => {
  const { searchTerm, page = 1, limit = 20, sort, role, ...filters } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: Prisma.ActivityLogWhereInput = {
    ...(filters as any),
  };

  // Enforce role-based visibility if not Admin
  if (requestingUser && requestingUser.role !== UserRole.Admin) {
    where.user_id = requestingUser.id;
  }

  // If role is provided (for admins searching), find users with that role
  if (role && requestingUser?.role === UserRole.Admin) {
    where.user = {
      role: role as UserRole,
    };
  }

  if (searchTerm) {
    where.OR = [
      { action_text: { contains: searchTerm as string, mode: 'insensitive' } },
      { resource: { contains: searchTerm as string, mode: 'insensitive' } },
    ];
  }

  const result = await prisma.activityLog.findMany({
    where,
    skip,
    take,
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
    orderBy: sort ? { [sort as string]: 'asc' } : { timestamp: 'desc' },
  });

  const total = await prisma.activityLog.count({ where });

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

export const undoActivityInDB = async (logId: string) => {
  const log = await prisma.activityLog.findUnique({
    where: { id: logId },
  });
  if (!log) throw new AppError('Activity log not found', 404);

  if (log.type === ActivityType.DELETE && log.resource === 'PRODUCT' && log.resource_id) {
    const product = await prisma.product.findUnique({
      where: { id: log.resource_id },
    });
    if (!product) throw new AppError('Original product not found', 404);

    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: { is_deleted: false },
    });

    await prisma.activityLog.update({
      where: { id: log.id },
      data: { is_undone: true },
    });

    return {
      message: `Product "${product.name}" has been restored successfully.`,
      product: updatedProduct,
    };
  }

  throw new AppError('This action cannot be undone.', 400);
};

export const redoActivityInDB = async (logId: string) => {
  const log = await prisma.activityLog.findUnique({
    where: { id: logId },
  });
  if (!log) throw new AppError('Activity log not found', 404);

  if (!log.is_undone) {
    throw new AppError('This action has not been undone, so it cannot be redone.', 400);
  }

  if (log.type === ActivityType.DELETE && log.resource === 'PRODUCT' && log.resource_id) {
    const product = await prisma.product.findUnique({
      where: { id: log.resource_id },
    });
    if (!product) throw new AppError('Original product not found', 404);

    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: { is_deleted: true },
    });

    await prisma.activityLog.update({
      where: { id: log.id },
      data: { is_undone: false },
    });

    return {
      message: `Product "${product.name}" has been deleted again (Redo).`,
      product: updatedProduct,
    };
  }

  throw new AppError('This action cannot be redone.', 400);
};
