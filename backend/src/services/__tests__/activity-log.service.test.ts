import prisma from '../../config/prisma';
import {
  getAllActivityLogsFromDB,
  undoActivityInDB,
  redoActivityInDB,
} from '../activity-log.service';
import { AppError } from '../../utils/AppError';
import { ActivityType } from '../../types';

// Mock dependencies
jest.mock('../../config/prisma', () => ({
  __esModule: true,
  default: {
    activityLog: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Activity Log Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllActivityLogsFromDB', () => {
    it('should return logs and meta', async () => {
      const mockLogs = [{ id: 'l1', action_text: 'test' }];
      (prisma.activityLog.findMany as jest.Mock).mockResolvedValue(mockLogs);
      (prisma.activityLog.count as jest.Mock).mockResolvedValue(1);

      const result = await getAllActivityLogsFromDB({});

      expect(prisma.activityLog.findMany).toHaveBeenCalled();
      expect(result.result).toEqual(mockLogs);
    });
  });

  describe('undoActivityInDB', () => {
    it('should restore a deleted product', async () => {
      const mockLog = {
        id: 'l1',
        type: ActivityType.DELETE,
        resource: 'PRODUCT',
        resource_id: 'p1',
      };
      const mockProduct = { id: 'p1', name: 'Test', is_deleted: true };

      (prisma.activityLog.findUnique as jest.Mock).mockResolvedValue(mockLog);
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.product.update as jest.Mock).mockResolvedValue({ ...mockProduct, is_deleted: false });

      const result = await undoActivityInDB('l1');

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { is_deleted: false },
      });
      expect(result.message).toContain('restored successfully');
    });

    it('should throw error if log not found', async () => {
      (prisma.activityLog.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(undoActivityInDB('invalid')).rejects.toThrow(
        new AppError('Activity log not found', 404),
      );
    });
  });

  describe('redoActivityInDB', () => {
    it('should re-delete a restored product', async () => {
      const mockLog = {
        id: 'l1',
        type: ActivityType.DELETE,
        resource: 'PRODUCT',
        resource_id: 'p1',
        is_undone: true,
      };
      const mockProduct = { id: 'p1', name: 'Test', is_deleted: false };

      (prisma.activityLog.findUnique as jest.Mock).mockResolvedValue(mockLog);
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.product.update as jest.Mock).mockResolvedValue({ ...mockProduct, is_deleted: true });

      const result = await redoActivityInDB('l1');

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { is_deleted: true },
      });
      expect(result.message).toContain('deleted again');
    });

    it('should throw 400 if action not undone', async () => {
      (prisma.activityLog.findUnique as jest.Mock).mockResolvedValue({ is_undone: false });
      await expect(redoActivityInDB('l1')).rejects.toThrow(/not been undone/);
    });

    it('should throw 404 if log not found', async () => {
      (prisma.activityLog.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(redoActivityInDB('l1')).rejects.toThrow('Activity log not found');
    });
  });

  describe('Activity Log Service - Additional Branches', () => {
    it('should filter by searchTerm', async () => {
      (prisma.activityLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.activityLog.count as jest.Mock).mockResolvedValue(0);
      await getAllActivityLogsFromDB({ searchTerm: 'test' });
      expect(prisma.activityLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ OR: expect.any(Array) }),
        }),
      );
    });

    it('should filter by role for Admin', async () => {
      (prisma.activityLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.activityLog.count as jest.Mock).mockResolvedValue(0);
      await getAllActivityLogsFromDB({ role: 'Manager' }, { id: 'a1', role: 'Admin' });
      expect(prisma.activityLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ user: { role: 'Manager' } }),
        }),
      );
    });

    it('should throw 400 if undo is not supported for action', async () => {
      (prisma.activityLog.findUnique as jest.Mock).mockResolvedValue({ type: ActivityType.CREATE });
      await expect(undoActivityInDB('l1')).rejects.toThrow('This action cannot be undone.');
    });

    it('should throw 400 if redo is not supported for action', async () => {
      (prisma.activityLog.findUnique as jest.Mock).mockResolvedValue({
        is_undone: true,
        type: ActivityType.CREATE,
      });
      await expect(redoActivityInDB('l1')).rejects.toThrow('This action cannot be redone.');
    });

    it('should throw 404 if product not found during undo', async () => {
      (prisma.activityLog.findUnique as jest.Mock).mockResolvedValue({
        type: ActivityType.DELETE,
        resource: 'PRODUCT',
        resource_id: 'p1',
      });
      (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(undoActivityInDB('l1')).rejects.toThrow('Original product not found');
    });
  });
});
