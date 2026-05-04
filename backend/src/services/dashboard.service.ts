import { Prisma, OrderStatus, UserRole } from '@prisma/client';
import prisma from '../config/prisma';

/**
 * Aggregates various system-wide statistics for the dashboard.
 * Includes today's metrics, low stock counts, revenue, and trends.
 */
export const getDashboardStatsFromDB = async () => {
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);

  // Today's total order volume
  const totalOrdersToday = await prisma.order.count({
    where: {
      createdAt: { gte: startToday },
    },
  });

  // Today's order status breakdown
  const orderStats = await prisma.order.groupBy({
    by: ['status'],
    where: {
      createdAt: { gte: startToday },
    },
    _count: {
      status: true,
    },
  });

  const pendingVsCompleted = {
    Pending: orderStats.find((s) => s.status === OrderStatus.Pending)?._count.status || 0,
    Completed: orderStats
      .filter((s) =>
        (
          [OrderStatus.Confirmed, OrderStatus.Shipped, OrderStatus.Delivered] as OrderStatus[]
        ).includes(s.status),
      )
      .reduce((acc, curr) => acc + curr._count.status, 0),
  };

  // Count products where stock level has fallen below the min_threshold
  const lowStockCount = await prisma.product.count({
    where: {
      is_restock_required: true,
    },
  });

  // Calculate gross revenue for today excluding cancelled orders
  const revenueTodayResult = await prisma.order.aggregate({
    where: {
      createdAt: { gte: startToday },
      status: { not: OrderStatus.Cancelled },
    },
    _sum: {
      total_price: true,
    },
  });

  const revenueToday = revenueTodayResult._sum.total_price || 0;

  const totalProducts = await prisma.product.count();

  // Distribution of products across categories
  const categoryDistributionRaw = await prisma.product.groupBy({
    by: ['category_id'],
    _count: {
      id: true,
    },
  });

  const categories = await prisma.category.findMany({
    where: {
      id: { in: categoryDistributionRaw.map((c) => c.category_id) },
    },
  });

  const categoryDistribution = categoryDistributionRaw.map((item) => ({
    name: categories.find((c) => c.id === item.category_id)?.name || 'Unknown',
    value: item._count.id,
  }));

  // Order trends (Count and Revenue) for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const ordersLast7Days = await prisma.order.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
    },
    select: {
      createdAt: true,
      total_price: true,
    },
  });

  const trendsMap = new Map<string, { count: number; revenue: number }>();
  ordersLast7Days.forEach((order) => {
    const dateStr = order.createdAt.toISOString().split('T')[0]!;
    const current = trendsMap.get(dateStr) || { count: 0, revenue: 0 };
    trendsMap.set(dateStr, {
      count: current.count + 1,
      revenue: current.revenue + order.total_price,
    });
  });

  const orderTrends = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0]!;
    const dayData = trendsMap.get(dateStr) || { count: 0, revenue: 0 };
    orderTrends.push({
      date: dateStr,
      count: dayData.count,
      revenue: dayData.revenue,
    });
  }

  // Brief inventory summary prioritized by low stock items
  const products = await prisma.product.findMany({
    orderBy: [{ stock_quantity: 'asc' }, { createdAt: 'desc' }],
    take: 10,
  });

  const productSummary: { name: string; stock_quantity: number; status: string }[] = products.map(
    (p) => ({
      name: p.name,
      stock_quantity: p.stock_quantity,
      status: p.stock_quantity <= p.min_threshold ? 'Low Stock' : 'OK',
    }),
  );

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

/**
 * Retrieves the 10 most recent activity logs.
 * Non-admin users are restricted to viewing only their own activity.
 */
export const getLatestActivitiesFromDB = async (requestingUser?: {
  id: string;
  role: UserRole | string;
}) => {
  const where: Prisma.ActivityLogWhereInput = {};

  if (requestingUser && requestingUser.role !== UserRole.Admin) {
    where.user_id = requestingUser.id;
  }

  const activities = await prisma.activityLog.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: 10,
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
  });

  return activities;
};
