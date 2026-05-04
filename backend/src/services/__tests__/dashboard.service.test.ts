import prisma from '../../config/prisma';
import { getDashboardStatsFromDB, getLatestActivitiesFromDB } from '../dashboard.service';
import { OrderStatus } from '../../types';

describe('Dashboard Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStatsFromDB', () => {
    it('should aggregate and calculate dashboard metrics correctly', async () => {
      (prisma.order.count as jest.Mock).mockResolvedValue(5);
      (prisma.order.groupBy as jest.Mock).mockResolvedValue([
        { status: OrderStatus.Pending, _count: { status: 2 } },
        { status: OrderStatus.Confirmed, _count: { status: 3 } },
      ]);
      (prisma.product.count as jest.Mock)
        .mockResolvedValueOnce(2) // lowStockCount
        .mockResolvedValueOnce(50); // totalProducts
      (prisma.order.aggregate as jest.Mock).mockResolvedValue({ _sum: { total_price: 1000 } });
      (prisma.product.groupBy as jest.Mock).mockResolvedValue([
        { category_id: 'cat1', _count: { id: 10 } },
      ]);
      (prisma.category.findMany as jest.Mock).mockResolvedValue([
        { id: 'cat1', name: 'Electronics' },
      ]);
      (prisma.order.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.product.findMany as jest.Mock).mockResolvedValue([
        { name: 'P1', stock_quantity: 5, min_threshold: 10 },
      ]);

      const stats = await getDashboardStatsFromDB();

      expect(prisma.order.count).toHaveBeenCalled();
      expect(stats.totalOrdersToday).toBe(5);
      expect(stats.revenueToday).toBe(1000);
      expect(stats.pendingVsCompleted.Pending).toBe(2);
      expect(stats.pendingVsCompleted.Completed).toBe(3);
      expect(stats.lowStockCount).toBe(2);
      expect(stats.totalProducts).toBe(50);
      expect(stats.categoryDistribution?.[0]?.name).toBe('Electronics');
    });
  });

  describe('getLatestActivitiesFromDB', () => {
    it('should fetch latest activity logs', async () => {
      const mockActivities = [{ action_text: 'Test Activity' }];
      (prisma.activityLog.findMany as jest.Mock).mockResolvedValue(mockActivities);

      const result = await getLatestActivitiesFromDB();

      expect(prisma.activityLog.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockActivities);
    });

    it('should filter activities for non-admin users', async () => {
      await getLatestActivitiesFromDB({ id: 'u1', role: 'Manager' });
      expect(prisma.activityLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'u1' },
        }),
      );
    });
  });

  describe('getDashboardStatsFromDB - Additional Branches', () => {
    it('should handle missing category names', async () => {
      (prisma.product.groupBy as jest.Mock).mockResolvedValue([
        { category_id: 'c1', _count: { id: 1 } },
      ]);
      (prisma.category.findMany as jest.Mock).mockResolvedValue([]); // No matching category
      (prisma.order.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.product.findMany as jest.Mock).mockResolvedValue([]);

      const stats = await getDashboardStatsFromDB();
      expect(stats.categoryDistribution?.[0]?.name).toBe('Unknown');
    });

    it('should calculate order trends correctly', async () => {
      const today = new Date();
      (prisma.order.findMany as jest.Mock).mockResolvedValue([
        { createdAt: today, total_price: 500 },
      ]);
      (prisma.product.findMany as jest.Mock).mockResolvedValue([]);

      const stats = await getDashboardStatsFromDB();
      const dateStr = today.toISOString().split('T')[0];
      const todayTrend = stats.orderTrends.find((t) => t.date === dateStr);
      expect(todayTrend?.revenue).toBe(500);
      expect(todayTrend?.count).toBe(1);
    });
  });
});
