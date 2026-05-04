import { trackClientEvents, getMetrics } from '../analytics.controller';
import prisma from '../../config/prisma';
import { Request, Response } from 'express';

// Using global prisma mock from setup.ts

describe('Analytics Controller', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('trackClientEvents', () => {
    it('should call createMany if events are provided', async () => {
      req.body.events = [{ eventName: 'click' }];
      (prisma.clientEvent.createMany as jest.Mock).mockResolvedValue({ count: 1 });

      await trackClientEvents(req as Request, res as Response, next);

      expect(prisma.clientEvent.createMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getMetrics', () => {
    it('should return aggregated metrics', async () => {
      (prisma.apiMetric.count as jest.Mock).mockResolvedValue(10);
      (prisma.clientEvent.count as jest.Mock).mockResolvedValue(5);
      (prisma.apiMetric.aggregate as jest.Mock).mockResolvedValue({ _avg: { duration: 100 } });

      await getMetrics(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            api: expect.objectContaining({ totalRequestsLog: 10 }),
          }),
        }),
      );
    });
  });
});
