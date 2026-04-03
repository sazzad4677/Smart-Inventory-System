import { z } from 'zod';
import { OrderStatus } from '../types';

export const createOrderSchema = z.object({
  body: z.object({
    customer_name: z.string({
      message: 'Customer name is required',
    }),
    items: z
      .array(
        z.object({
          product_id: z.string({
            message: 'Product ID is required',
          }),
          quantity: z
            .number({
              message: 'Quantity must be a number',
            })
            .int()
            .positive({
              message: 'Quantity must be a positive integer',
            }),
        }),
      )
      .min(1, {
        message: 'At least one item is required in the order',
      }),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(OrderStatus, {
      message: 'Invalid order status',
    }),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body'];
