import { getAllActivityLogs } from '../activity-log.controller';
import * as activityLogService from '../../services/activity-log.service';
import { Request, Response } from 'express';

// Mock activity log service
jest.mock('../../services/activity-log.service');

describe('ActivityLogController', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      query: {},
      user: { _id: 'user123', role: 'manager' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('getAllActivityLogs', () => {
    it('should return 200 and activity logs on success', async () => {
      const mockResult = {
        meta: { total: 10 },
        result: [{ _id: 'l1', action_text: 'Admin logged in', timestamp: new Date() }],
      };
      (activityLogService.getAllActivityLogsFromDB as jest.Mock).mockResolvedValue(mockResult);

      await getAllActivityLogs(req as Request, res as Response, next);

      expect(activityLogService.getAllActivityLogsFromDB).toHaveBeenCalledWith(req.query, {
        _id: 'user123',
        role: 'manager',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Activity logs fetched successfully.',
          data: mockResult.result,
        }),
      );
    });

    it('should call next(error) if service fails', async () => {
      const error = new Error('Activity log retrieval failed');
      (activityLogService.getAllActivityLogsFromDB as jest.Mock).mockRejectedValue(error);

      await getAllActivityLogs(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
