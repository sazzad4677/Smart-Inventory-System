import Product, { IProductDocument } from '../models/product.model';
import QueryBuilder from '../builders/QueryBuilder';

//GET /api/restock-queue (Permissions: Admin, Manager)

export const getRestockQueueFromDB = async (query: Record<string, unknown>) => {
  const lowStockFilter = {
    $expr: { $lte: ['$stock_quantity', '$min_threshold'] },
  };

  const searchableFields = ['name'];

  const productQuery = new QueryBuilder<IProductDocument>(Product.find(lowStockFilter), query)
    .search(searchableFields)
    .sort()
    .paginate()
    .fields();

  const products = (await productQuery.modelQuery.lean()) as any[];
  const meta = await productQuery.countTotal();

  const result = products.map((product) => {
    let priority = 'Low';
    if (product.stock_quantity === 0) {
      priority = 'High';
    } else if (product.stock_quantity <= product.min_threshold / 2) {
      priority = 'Medium';
    }

    return {
      _id: product._id,
      name: product.name,
      stock_quantity: product.stock_quantity,
      min_threshold: product.min_threshold,
      priority,
    };
  });

  return {
    meta,
    result,
  };
};
