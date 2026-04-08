import { getDashboardStatsFromDB, getLatestActivitiesFromDB } from '../dashboard.service';
import Order from '../../models/order.model';
import Product from '../../models/product.model';
import ActivityLog from '../../models/activity-log.model';

// Mock dependencies
jest.mock('../../models/order.model');
jest.mock('../../models/product.model');
jest.mock('../../models/activity-log.model');

describe('Dashboard Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStatsFromDB', () => {
    it('should aggregate and calculate dashboard metrics correctly', async () => {
      (Order.countDocuments as jest.Mock).mockResolvedValue(5);
      (Order.aggregate as jest.Mock)
        .mockResolvedValueOnce([
          { _id: 'Pending', count: 2 },
          { _id: 'Confirmed', count: 3 },
        ]) // pendingVsCompleted
        .mockResolvedValueOnce([{ _id: null, total: 1000 }]); // revenueToday

      (Product.countDocuments as jest.Mock).mockResolvedValueOnce(2); // lowStockCount
      (Product.countDocuments as jest.Mock).mockResolvedValueOnce(50); // totalProducts
      (Product.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([
          { name: 'P1', stock_quantity: 5, min_threshold: 10 },
          { name: 'P2', stock_quantity: 20, min_threshold: 10 },
        ]),
      });

      const stats = await getDashboardStatsFromDB();

      expect(Order.countDocuments).toHaveBeenCalled();
      expect(Order.aggregate).toHaveBeenCalledTimes(2);
      expect(Product.countDocuments).toHaveBeenCalledTimes(2);

      expect(stats.totalOrdersToday).toBe(5);
      expect(stats.revenueToday).toBe(1000);
      expect(stats.pendingVsCompleted.Pending).toBe(2);
      expect(stats.pendingVsCompleted.Completed).toBe(3);
      expect(stats.lowStockCount).toBe(2);
      expect(stats.totalProducts).toBe(50);
      expect(stats.productSummary[0].status).toBe('Low Stock');
      expect(stats.productSummary[1].status).toBe('OK');
    });
  });

  describe('getLatestActivitiesFromDB', () => {
    it('should fetch populated activity logs', async () => {
      const mockActivities = [{ action_text: 'Test Activity' }];
      (ActivityLog.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockActivities),
      });

      const result = await getLatestActivitiesFromDB();

      expect(ActivityLog.find).toHaveBeenCalled();
      expect(result).toEqual(mockActivities);
    });
  });
});
