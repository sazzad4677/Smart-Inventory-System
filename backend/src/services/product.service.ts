import QueryBuilder from '../builders/QueryBuilder';
import Product, { IProductDocument } from '../models/product.model';
import { CreateProductInput, UpdateProductInput } from '../validators/product.validator';

// ─── Create Product Into DB ────────────────────────────────────────────────
export const createProductIntoDB = async (payload: CreateProductInput) => {
  const result = await Product.create(payload as any);
  return result;
};

// ─── Get All Products From DB ───────────────────────────────────────────────
export const getAllProductsFromDB = async (query: Record<string, unknown>) => {
  const searchableFields = ['name']; // As per user request

  const productQuery = new QueryBuilder<IProductDocument>(
    Product.find().populate('category_id'),
    query,
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await productQuery.modelQuery;
  const meta = await productQuery.countTotal();

  return {
    meta,
    result,
  };
};

// ─── Update Product In DB ──────────────────────────────────────────────────
export const updateProductInDB = async (id: string, payload: UpdateProductInput) => {
  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};
