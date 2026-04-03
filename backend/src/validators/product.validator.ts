import { z } from 'zod';
import { ProductStatus } from '../types';

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({
        message: 'Product name is required',
      })
      .trim()
      .min(1, 'Product name is required'),
    category_id: z
      .string({
        message: 'Category is required',
      })
      .trim()
      .min(1, 'Category is required'),
    price: z
      .number({
        message: 'Price is required',
      })
      .min(0, 'Price must be a non-negative number'),
    stock_quantity: z
      .number({
        message: 'Stock quantity is required',
      })
      .min(0, 'Stock quantity must be a non-negative number'),
    min_threshold: z
      .number({
        message: 'Minimum threshold is required',
      })
      .min(0, 'Minimum threshold must be a non-negative number'),
    status: z.enum(ProductStatus).optional(),
  }),
});

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
