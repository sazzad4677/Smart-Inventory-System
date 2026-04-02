import { Schema, model, Document, Model } from 'mongoose';
import { ICategory } from '../types';

export interface ICategoryDocument extends ICategory, Document {}

export interface ICategoryModel extends Model<ICategoryDocument> {}

const categorySchema = new Schema<ICategoryDocument, ICategoryModel>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false },
);

const Category = model<ICategoryDocument, ICategoryModel>('Category', categorySchema);
export default Category;
