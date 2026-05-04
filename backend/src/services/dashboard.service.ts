import { Prisma, OrderStatus, UserRole } from '@prisma/client';
import prisma from '../config/prisma';

// ─── GET /api/dashboard/dashboard (Permissions: Admin, Manager) ──────────────
export const getDashboardStatsFromDB = async () => {
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);

  // 1. Total orders today
  const totalOrdersToday = await prisma.order.count({
    where: {
      createdAt: { gte: startToday },
    },
  });

  // 2. Pending vs Completed orders (for today)
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

  // 3. Low stock count
  // Prisma doesn't support comparing two columns directly in where easily without raw query or computed field
  // But we can use findMany and filter or a raw query.
  // For better performance, we'll use a raw query here.
  const lowStockCount = await prisma.product.count({
    where: {
      is_restock_required: true,
    },
  });

  // 4. Revenue today
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

  // 5. Total Products
  const totalProducts = await prisma.product.count();

  // 6. Category Distribution
  const categoryDistributionRaw = await prisma.product.groupBy({
    by: ['category_id'],
    _count: {
      id: true,
    },
  });

  // Fetch category names
  const categories = await prisma.category.findMany({
    where: {
      id: { in: categoryDistributionRaw.map((c) => c.category_id) },
    },
  });

  const categoryDistribution = categoryDistributionRaw.map((item) => ({
    name: categories.find((c) => c.id === item.category_id)?.name || 'Unknown',
    value: item._count.id,
  }));

  // 7. Order Trends (Last 7 Days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // We'll fetch all orders from the last 7 days and process them in JS for easier date formatting
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

  // 8. Product Summary (Prioritize Low Stock Items)
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

// ─── GET /api/dashboard/activities (Permissions: All Logged In Users) ───────────────────
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
