import { getAllActivityLogs, undoActivity, redoActivity } from '../activity-log.controller';
import * as activityLogService from '../../services/activity-log.service';
import { Request, Response } from 'express';

// Mock services
jest.mock('../../services/activity-log.service');

describe('Activity Log Controller', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {},
      query: {},
      user: { id: 'user123', role: 'Manager' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('getAllActivityLogs', () => {
    it('should return 200 and activity logs', async () => {
      const mockResult = { result: [{ id: 'l1' }], meta: {} };
      (activityLogService.getAllActivityLogsFromDB as jest.Mock).mockResolvedValue(mockResult);

      await getAllActivityLogs(req as any, res as any, next);

      expect(activityLogService.getAllActivityLogsFromDB).toHaveBeenCalledWith(req.query, {
        id: 'user123',
        role: 'Manager',
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('undoActivity', () => {
    it('should call undoActivityInDB and return 200', async () => {
      req.params.id = 'l1';
      (activityLogService.undoActivityInDB as jest.Mock).mockResolvedValue({
        message: 'restored',
        product: {},
      });

      await undoActivity(req as any, res as any, next);

      expect(activityLogService.undoActivityInDB).toHaveBeenCalledWith('l1');
    });
  });

  describe('redoActivity', () => {
    it('should call redoActivityInDB and return 200', async () => {
      req.params.id = 'l1';
      (activityLogService.redoActivityInDB as jest.Mock).mockResolvedValue({
        message: 'redone',
        product: {},
      });

      await redoActivity(req as any, res as any, next);

      expect(activityLogService.redoActivityInDB).toHaveBeenCalledWith('l1');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
