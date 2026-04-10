import Product from '../models/product.model';
import Order from '../models/order.model';
import ActivityLog from '../models/activity-log.model';

// ─── GET /api/dashboard/dashboard (Permissions: Admin, Manager) ──────────────
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
    $expr: { $lte: ['$stock_quantity', '$min_threshold'] },
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

  // 6. Category Distribution
  const categoryDistribution = await Product.aggregate([
    {
      $group: {
        _id: '$category_id',
        value: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $project: {
        _id: 0,
        name: '$category.name',
        value: 1,
      },
    },
  ]);

  // 7. Order Trends (Last 7 Days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const orderTrendsRaw = await Order.aggregate([
    { $match: { created_at: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
        count: { $sum: 1 },
        revenue: { $sum: '$total_price' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill in missing days for the chart
  const orderTrends = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayData = orderTrendsRaw.find((t) => t._id === dateStr);
    orderTrends.push({
      date: dateStr,
      count: dayData ? dayData.count : 0,
      revenue: dayData ? dayData.revenue : 0,
    });
  }

  // 8. Product Summary (Prioritize Low Stock Items)
  const products = await Product.find().sort({ stock_quantity: 1, createdAt: -1 }).limit(10);

  const productSummary = products.map((p) => ({
    name: p.name,
    stock_quantity: p.stock_quantity,
    status: p.stock_quantity <= p.min_threshold ? 'Low Stock' : 'OK',
  }));

  return {
    totalOrdersToday,
    pendingVsCompleted,
    lowStockCount,
    revenueToday,
    totalProducts,
    productSummary,
    categoryDistribution,
    orderTrends,
  };
};

// ─── GET /api/dashboard/activities (Permissions: All Logged In Users) ───────────────────
export const getLatestActivitiesFromDB = async (requestingUser?: { _id: string; role: string }) => {
  const query: any = {};

  if (requestingUser && requestingUser.role !== 'Admin') {
    query.user_id = requestingUser._id;
  }

  const activities = await ActivityLog.find(query)
    .sort({ timestamp: -1 })
    .limit(10)
    .populate('user_id', 'email role');

  return activities;
};
