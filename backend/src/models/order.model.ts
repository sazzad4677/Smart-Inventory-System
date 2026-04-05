import { Schema, model, Document, Model } from 'mongoose';
import { IOrder, OrderStatus } from '../types';

export interface IOrderDocument extends IOrder, Document {}

export interface IOrderModel extends Model<IOrderDocument> {}

const orderSchema = new Schema<IOrderDocument, IOrderModel>(
  {
    order_id: {
      type: String,
      unique: true,
    },
    customer_name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    total_price: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price must be a non-negative number'],
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      required: [true, 'Order status is required'],
      default: OrderStatus.Pending,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

// Query middleware to exclude deleted records
orderSchema.pre(/^find/, function (this: any) {
  this.where({ is_deleted: { $ne: true } });
});

const Order = model<IOrderDocument, IOrderModel>('Order', orderSchema);
export default Order;
