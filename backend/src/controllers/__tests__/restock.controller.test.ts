import { getRestockQueue } from '../restock.controller';
import * as restockService from '../../services/restock.service';
import { Request, Response } from 'express';

// Mock restock service
jest.mock('../../services/restock.service');

describe('RestockController', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('getRestockQueue', () => {
    it('should return 200 and restock queue data on success', async () => {
      const mockResult = {
        meta: { total: 1 },
        result: [{ id: 'p1', name: 'Product 1', priority: 'High' }],
      };
      (restockService.getRestockQueueFromDB as jest.Mock).mockResolvedValue(mockResult);

      await getRestockQueue(req as Request, res as Response, next);

      expect(restockService.getRestockQueueFromDB).toHaveBeenCalledWith(req.query);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockResult.result,
        }),
      );
    });
  });
});
