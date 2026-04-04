import Product from '../models/product.model';
import Order from '../models/order.model';
import ActivityLog from '../models/activity-log.model';

// ─── GET /api/restock-queue Logic ───────────────────────────────────────────
export const getRestockQueueFromDB = async () => {
  const products = await Product.find({
    $expr: { $lt: ['$stock_quantity', '$min_threshold'] },
  }).sort({ stock_quantity: 1 });

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

  return result;
};

// ─── GET /api/dashboard Logic ──────────────────────────────────────────────
export const getDashboardStatsFromDB = async () => {
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);

  // 1. Total orders today
  const totalOrdersToday = await Order.countDocuments({
    created_at: { $gte: startToday },
  });

  // 2. Pending vs Completed orders (for today)
  const orderStats = await Order.aggregate([
    { $match: { created_at: { $gte: startToday } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const pendingVsCompleted = {
    Pending: orderStats.find((s) => s._id === 'Pending')?.count || 0,
    Completed:
      (orderStats.find((s) => s._id === 'Confirmed')?.count || 0) +
      (orderStats.find((s) => s._id === 'Shipped')?.count || 0) +
      (orderStats.find((s) => s._id === 'Delivered')?.count || 0),
  };

  // 3. Low stock count
  const lowStockCount = await Product.countDocuments({
    $expr: { $lt: ['$stock_quantity', '$min_threshold'] },
  });

  // 4. Revenue today
  const revenueTodayResult = await Order.aggregate([
    {
      $match: {
        created_at: { $gte: startToday },
        status: { $nin: ['Cancelled'] }, // Count only non-cancelled orders for revenue
      },
    },
    { $group: { _id: null, total: { $sum: '$total_price' } } },
  ]);

  const revenueToday = revenueTodayResult.length > 0 ? revenueTodayResult[0].total : 0;

  // 5. Total Products
  const totalProducts = await Product.countDocuments();

  // 6. Product Summary (Prioritize Low Stock Items)
  const products = await Product.find().sort({ stock_quantity: 1, createdAt: -1 }).limit(10);

  const productSummary = products.map((p) => ({
    name: p.name,
    stock_quantity: p.stock_quantity,
    status: p.stock_quantity < p.min_threshold ? 'Low Stock' : 'OK',
  }));

  return {
    totalOrdersToday,
    pendingVsCompleted,
    lowStockCount,
    revenueToday,
    totalProducts,
    productSummary,
  };
};

// ─── GET /api/activities Logic ──────────────────────────────────────────────
export const getLatestActivitiesFromDB = async () => {
  const activities = await ActivityLog.find()
    .sort({ timestamp: -1 })
    .limit(10)
    .populate('user_id', 'email role');

  return activities;
};
