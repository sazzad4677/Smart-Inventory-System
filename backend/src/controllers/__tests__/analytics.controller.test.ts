import { trackClientEvents, getMetrics } from '../analytics.controller';
import ClientEvent from '../../models/ClientEvent.model';
import ApiMetric from '../../models/ApiMetric.model';
import { Request, Response } from 'express';

// Mock models
jest.mock('../../models/ClientEvent.model');
jest.mock('../../models/ApiMetric.model');

describe('Analytics Controller', () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('trackClientEvents', () => {
    it('should return 200 and track events if provided in body', async () => {
      req.body.events = [{ type: 'click', page: '/dashboard' }];
      (ClientEvent.insertMany as jest.Mock).mockResolvedValue({});

      await trackClientEvents(req as Request, res as Response, next);

      expect(ClientEvent.insertMany).toHaveBeenCalledWith(req.body.events);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Events tracked successfully' }),
      );
    });

    it('should return 200 and skip tracking if events array is empty', async () => {
      req.body.events = [];
      await trackClientEvents(req as Request, res as Response, next);

      expect(ClientEvent.insertMany).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe('getMetrics', () => {
    it('should return 200 and detailed metrics data', async () => {
      (ApiMetric.countDocuments as jest.Mock).mockResolvedValueOnce(100); // totalApiMetrics
      (ApiMetric.countDocuments as jest.Mock).mockResolvedValueOnce(10); // slowRequests
      (ClientEvent.countDocuments as jest.Mock).mockResolvedValue(50); // totalClientEvents
      (ApiMetric.aggregate as jest.Mock).mockResolvedValue([{ avgTime: 250.4 }]);

      await getMetrics(req as Request, res as Response, next);

      expect(ApiMetric.countDocuments).toHaveBeenCalledTimes(2);
      expect(ClientEvent.countDocuments).toHaveBeenCalled();
      expect(ApiMetric.aggregate).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          api: {
            totalRequestsLog: 100,
            slowRequests: 10,
            averageResponseTimeMs: 250,
          },
          client: {
            totalEventsLog: 50,
          },
        },
      });
    });

    it('should return 0 as average response time if no metrics exist', async () => {
      (ApiMetric.countDocuments as jest.Mock).mockResolvedValue(0);
      (ClientEvent.countDocuments as jest.Mock).mockResolvedValue(0);
      (ApiMetric.aggregate as jest.Mock).mockResolvedValue([]);

      await getMetrics(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            api: expect.objectContaining({ averageResponseTimeMs: 0 }),
          }),
        }),
      );
    });
  });
});
