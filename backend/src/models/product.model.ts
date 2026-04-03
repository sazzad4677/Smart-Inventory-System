import { Schema, model, Document, Model, Types } from 'mongoose';
import { IProduct, ProductStatus } from '../types';

export interface IProductDocument extends Omit<IProduct, 'category_id'>, Document {
  category_id: Types.ObjectId;
}

export interface IProductModel extends Model<IProductDocument> {}

const productSchema = new Schema<IProductDocument, IProductModel>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a non-negative number'],
    },
    stock_quantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity must be a non-negative number'],
      default: 0,
    },
    min_threshold: {
      type: Number,
      required: [true, 'Minimum threshold is required'],
      min: [0, 'Minimum threshold must be a non-negative number'],
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      required: [true, 'Status is required'],
      default: ProductStatus.Active,
    },
    is_restock_required: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

// Pre-save: auto-set status based on stock_quantity
productSchema.pre<IProductDocument>('save', function () {
  if (this.isModified('stock_quantity')) {
    this.status = this.stock_quantity <= 0 ? ProductStatus.OutOfStock : ProductStatus.Active;
  }
});

const Product = model<IProductDocument, IProductModel>('Product', productSchema);
export default Product;
