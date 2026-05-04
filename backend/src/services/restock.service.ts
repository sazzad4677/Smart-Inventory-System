import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';

/**
 * Retrieves a list of products that require restocking based on the is_restock_required flag.
 * Calculates restocking priority based on current stock levels relative to thresholds.
 */
export const getRestockQueueFromDB = async (query: Record<string, unknown>) => {
  const { searchTerm, page = 1, limit = 20, sort, ...filters } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: Prisma.ProductWhereInput = {
    is_restock_required: true,
    is_deleted: false,
    ...(filters as any),
  };

  if (searchTerm) {
    where.OR = [{ name: { contains: searchTerm as string, mode: 'insensitive' } }];
  }

  const products = await prisma.product.findMany({
    where,
    skip,
    take,
    orderBy: sort ? { [sort as string]: 'asc' } : { stock_quantity: 'asc' },
  });

  const total = await prisma.product.count({ where });

  const result = products.map((product) => {
    let priority = 'Low';
    if (product.stock_quantity === 0) {
      priority = 'High';
    } else if (product.stock_quantity <= product.min_threshold / 2) {
      priority = 'Medium';
    }

    return {
      id: product.id,
      name: product.name,
      stock_quantity: product.stock_quantity,
      min_threshold: product.min_threshold,
      priority,
    };
  });

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
