import User from '../models/user.model';
import Session from '../models/session.model';
import { Types } from 'mongoose';

export const getAllUsersWithSessions = async (): Promise<any[]> => {
  return User.aggregate([
    {
      $lookup: {
        from: 'sessions',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$userId', '$$userId'] },
              expiresAt: { $gt: new Date() },
            },
          },
        ],
        as: 'activeSessions',
      },
    },
    {
      $project: {
        email: 1,
        role: 1,
        createdAt: 1,
        activeSessionCount: { $size: '$activeSessions' },
        lastActivity: { $max: '$activeSessions.updatedAt' },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);
};

export const revokeUserSessions = async (userId: string): Promise<any> => {
  return Session.deleteMany({ userId: new Types.ObjectId(userId) });
};
