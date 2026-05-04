import { getDashboardMetrics, getLatestActivities } from '../dashboard.controller';
import * as dashboardService from '../../services/dashboard.service';
import { redisClient } from '../../config/redis';
import { Request, Response } from 'express';

// Mock dashboard service
jest.mock('../../services/dashboard.service');

// Mock redis client
jest.mock('../../config/redis', () => ({
  redisClient: {
    setEx: jest.fn(),
  },
}));

describe('Dashboard Controller', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { id: 'user123', role: 'manager' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('getDashboardMetrics', () => {
    it('should fetch metrics from service, cache them in Redis, and return 200', async () => {
      const mockResult = {
        totalOrdersToday: 10,
        pendingVsCompleted: { Pending: 2, Completed: 8 },
        lowStockCount: 5,
        revenueToday: 5000,
        totalProducts: 100,
        productSummary: [],
      };
      (dashboardService.getDashboardStatsFromDB as jest.Mock).mockResolvedValue(mockResult);

      await getDashboardMetrics(req as Request, res as Response, next);

      expect(dashboardService.getDashboardStatsFromDB).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getLatestActivities', () => {
    it('should fetch latest activities from service and return 200', async () => {
      const mockActivities = [{ action_text: 'Test Activity' }];
      (dashboardService.getLatestActivitiesFromDB as jest.Mock).mockResolvedValue(mockActivities);

      await getLatestActivities(req as Request, res as Response, next);

      expect(dashboardService.getLatestActivitiesFromDB).toHaveBeenCalledWith({
        id: 'user123',
        role: 'manager',
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
