import mongoose from 'mongoose';
import Order from '../models/order.model';
import OrderItem from '../models/order-item.model';
import Product from '../models/product.model';
import ActivityLog from '../models/activity-log.model';
import { CreateOrderInput } from '../validators/order.validator';
import { AppError } from '../utils/AppError';
import { OrderStatus, ProductStatus } from '../types';
import QueryBuilder from '../builders/QueryBuilder';

// ─── Create Order In DB ──────────────────────────────────────────────────
export const createOrderInDB = async (userId: string, payload: CreateOrderInput) => {
  const { customer_name, items } = payload;

  // 1. Check for duplicate product_ids
  const productIds = items.map((item) => item.product_id);
  const uniqueProductIds = new Set(productIds);
  if (uniqueProductIds.size !== productIds.length) {
    throw new AppError('Conflict Detection: Duplicate products found in the order.', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalPrice = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await Product.findById(item.product_id).session(session);

      if (!product) {
        throw new AppError(`Product with ID ${item.product_id} not found`, 404);
      }

      // 3. Check if product.status is Active
      if (product.status !== ProductStatus.Active) {
        throw new AppError(
          `Conflict Detection: Product "${product.name}" is not Active (${product.status})`,
          400,
        );
      }

      // 4. Check if requested_qty > stock_quantity
      if (item.quantity > product.stock_quantity) {
        throw new AppError(
          `Only ${product.stock_quantity} items available for "${product.name}"`,
          400,
        );
      }

      // 5. Update stock and handle Trigger B
      product.stock_quantity -= item.quantity;

      // If stock < min_threshold, flag for Restock Queue
      if (product.stock_quantity < product.min_threshold) {
        product.is_restock_required = true;
      }

      // Stock hits 0 -> status update handled by Product model pre-save hook
      await product.save({ session });

      const itemTotalPrice = product.price * item.quantity;
      totalPrice += itemTotalPrice;

      orderItemsData.push({
        product_id: product._id,
        quantity: item.quantity,
        unit_price: product.price,
      });
    }

    // 6. Create the Order
    const [order] = await Order.create(
      [
        {
          customer_name,
          total_price: totalPrice,
          status: OrderStatus.Pending,
        },
      ],
      { session },
    );

    if (!order) {
      throw new AppError('Failed to create order', 500);
    }

    // 7. Create OrderItems
    await OrderItem.create(
      orderItemsData.map((item) => ({
        ...item,
        order_id: order._id,
      })),
      { session },
    );

    // 8. Create Activity Log entry
    await ActivityLog.create(
      [
        {
          action_text: `Order #${order._id} created for ${customer_name}`,
          user_id: userId,
          timestamp: new Date(),
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// ─── Get All Orders From DB ──────────────────────────────────────────────
export const getAllOrdersFromDB = async (query: Record<string, unknown>) => {
  const orderQuery = new QueryBuilder(Order.find(), query).filter().sort().paginate().fields();

  const result = await orderQuery.modelQuery;
  const meta = await orderQuery.countTotal();

  return {
    meta,
    result,
  };
};

// ─── Update Order Status In DB ───────────────────────────────────────────
export const updateOrderStatusInDB = async (
  userId: string,
  orderId: string,
  status: OrderStatus,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { returnDocument: 'after', runValidators: true, session },
    );

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // [Trigger] Activity log on status change
    await ActivityLog.create(
      [
        {
          action_text: `Order #${order._id} status updated to ${status}`,
          user_id: userId,
          timestamp: new Date(),
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
