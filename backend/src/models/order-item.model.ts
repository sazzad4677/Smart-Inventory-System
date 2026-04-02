import { Schema, model, Document, Model, Types } from 'mongoose';
import { IOrderItem } from '../types';

export interface IOrderItemDocument extends Omit<IOrderItem, 'order_id' | 'product_id'>, Document {
  order_id: Types.ObjectId;
  product_id: Types.ObjectId;
}

export interface IOrderItemModel extends Model<IOrderItemDocument> {}

const orderItemSchema = new Schema<IOrderItemDocument, IOrderItemModel>(
  {
    order_id: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit_price: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price must be a non-negative number'],
    },
  },
  { timestamps: true, versionKey: false },
);

const OrderItem = model<IOrderItemDocument, IOrderItemModel>('OrderItem', orderItemSchema);
export default OrderItem;
