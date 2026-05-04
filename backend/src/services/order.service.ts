import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { CreateOrderInput } from '../validators/order.validator';
import { AppError } from '../utils/AppError';
import { OrderStatus, ProductStatus } from '../types';
import { generateNextId } from '../utils/id.utils';
import { captureActivity } from '../utils/activity-logger';
import { ActivityType } from '../types';
import { Request } from 'express';

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
}

export const createOrderInDB = async (req: Request, userId: string, payload: CreateOrderInput) => {
  const { customer_name, items } = payload;

  const order_id = await generateNextId('order_id', 'ORD');

  // Validate for duplicate product IDs in the request
  const productIds = items.map((item) => item.product_id);
  const uniqueProductIds = new Set(productIds);
  if (uniqueProductIds.size !== productIds.length) {
    throw new AppError('Duplicate products found in the order.', 400);
  }

  return await prisma.$transaction(async (tx) => {
    let totalPrice = 0;
    const lowStockProducts: LowStockProduct[] = [];
    const orderItemsToCreate: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.product_id },
      });

      if (!product) {
        throw new AppError(`Product with ID ${item.product_id} not found`, 404);
      }

      if (product.status !== ProductStatus.Active) {
        throw new AppError(
          `Conflict Detection: Product "${product.name}" is not Active (${product.status})`,
          400,
        );
      }

      if (item.quantity > product.stock_quantity) {
        throw new AppError(
          `Only ${product.stock_quantity} items available for "${product.name}"`,
          400,
        );
      }

      const newStockQuantity = product.stock_quantity - item.quantity;
      const isRestockRequired = newStockQuantity <= product.min_threshold;
      const newStatus = newStockQuantity <= 0 ? ProductStatus.OutOfStock : ProductStatus.Active;

      // Update inventory for each item in the order
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock_quantity: newStockQuantity,
          is_restock_required: isRestockRequired,
          status: newStatus,
        },
      });

      if (isRestockRequired) {
        lowStockProducts.push({
          id: product.id,
          name: product.name,
          stock: newStockQuantity,
        });
      }

      const itemTotalPrice = product.price * item.quantity;
      totalPrice += itemTotalPrice;

      orderItemsToCreate.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: product.price,
      });
    }

    const order = await tx.order.create({
      data: {
        customer_name,
        order_id,
        total_price: totalPrice,
        status: OrderStatus.Pending,
        orderItems: {
          create: orderItemsToCreate,
        },
      },
      include: {
        orderItems: true,
      },
    });

    await captureActivity(req, {
      type: ActivityType.CREATE,
      resource: 'ORDER',
      action_text: `Order ${order.order_id} created for ${customer_name}`,
      userId,
    });

    return { order, lowStockProducts };
  });
};

export const getAllOrdersFromDB = async (query: Record<string, unknown>) => {
  const { searchTerm, page = 1, limit = 20, sort, ...filters } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: Prisma.OrderWhereInput = {
    is_deleted: false,
    ...(filters as any),
  };

  if (searchTerm) {
    where.OR = [
      { customer_name: { contains: searchTerm as string, mode: 'insensitive' } },
      { order_id: { contains: searchTerm as string, mode: 'insensitive' } },
    ];
  }

  const result = await prisma.order.findMany({
    where,
    skip,
    take,
    orderBy: sort ? { [sort as string]: 'asc' } : { createdAt: 'desc' },
  });

  const total = await prisma.order.count({ where });

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

export const getOrderByIdFromDB = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  return {
    order,
    items: order.orderItems,
  };
};

export const updateOrderStatusInDB = async (
  req: Request,
  userId: string,
  orderId: string,
  status: OrderStatus,
) => {
  return await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!existingOrder) {
      throw new AppError('Order not found', 404);
    }

    if (existingOrder.status === OrderStatus.Cancelled) {
      throw new AppError('Order is already cancelled.', 400);
    }

    // If order is being cancelled, restore stock for all items
    if (status === OrderStatus.Cancelled) {
      for (const item of existingOrder.orderItems) {
        const product = await tx.product.findUnique({
          where: { id: item.product_id },
        });

        if (product) {
          const newStockQuantity = product.stock_quantity + item.quantity;
          await tx.product.update({
            where: { id: product.id },
            data: {
              stock_quantity: newStockQuantity,
              is_restock_required: newStockQuantity <= product.min_threshold,
              status: newStockQuantity > 0 ? ProductStatus.Active : ProductStatus.OutOfStock,
            },
          });
        }
      }
    }

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status },
    });

    await captureActivity(req, {
      type: ActivityType.UPDATE,
      resource: 'ORDER',
      action_text: `Order ${updatedOrder.order_id} status updated to ${status}`,
      userId,
    });

    return updatedOrder;
  });
};

export const deleteOrderFromDB = async (req: Request, userId: string, orderId: string) => {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { is_deleted: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  await captureActivity(req, {
    type: ActivityType.DELETE,
    resource: 'ORDER',
    action_text: `Order ${order.order_id} deleted`,
    userId,
  });

  return order;
};
