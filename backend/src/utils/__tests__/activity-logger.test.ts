import { captureActivity } from '../activity-logger';
import prisma from '../../config/prisma';
import { ActivityType } from '../../types';
import { logger } from '../logger';

jest.mock('../../config/prisma', () => ({
  default: {
    activityLog: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('Activity Logger Utility', () => {
  let req: any;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      headers: { 'user-agent': 'test-agent' },
      socket: { remoteAddress: '127.0.0.1' },
      app: { get: jest.fn() },
    };
  });

  it('should log activity successfully', async () => {
    (prisma.activityLog.create as jest.Mock).mockResolvedValue({ id: 'l1' });

    await captureActivity(req, {
      type: ActivityType.CREATE,
      action_text: 'Test',
      userId: 'u1',
    });

    expect(prisma.activityLog.create).toHaveBeenCalled();
  });

  it('should use x-forwarded-for if present', async () => {
    req.headers['x-forwarded-for'] = '1.1.1.1';
    (prisma.activityLog.create as jest.Mock).mockResolvedValue({ id: 'l1' });

    await captureActivity(req, { type: ActivityType.CREATE, action_text: 'T', userId: 'u1' });

    expect(prisma.activityLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ip_address: '1.1.1.1' }),
      }),
    );
  });

  it('should skip logging if no user ID', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    await captureActivity(null, { type: ActivityType.CREATE, action_text: 'T' });
    expect(prisma.activityLog.create).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should emit via socket if io is present', async () => {
    const mockIo = { emit: jest.fn() };
    req.app.get.mockReturnValue(mockIo);
    (prisma.activityLog.create as jest.Mock).mockResolvedValue({ id: 'l1' });

    await captureActivity(req, { type: ActivityType.RESTOCK, action_text: 'T', userId: 'u1' });

    expect(mockIo.emit).toHaveBeenCalledWith(
      'new_activity',
      expect.objectContaining({
        message: 'Stock Updated',
      }),
    );
  });

  it('should catch and log errors', async () => {
    (prisma.activityLog.create as jest.Mock).mockRejectedValue(new Error('DB Fail'));

    await captureActivity(req, { type: ActivityType.CREATE, action_text: 'T', userId: 'u1' });

    expect(logger.error).toHaveBeenCalled();
  });
});
