import { Request } from 'express';
import ActivityLog from '../models/activity-log.model';
import { ActivityType } from '../types';
import { Types } from 'mongoose';
import { logger } from './logger';

interface LogOptions {
  type: ActivityType;
  resource?: string;
  resourceId?: string;
  action_text: string;
  details?: Record<string, any>;
  userId?: Types.ObjectId;
}

/**
 * Robust activity logger that automatically captures IP and User-Agent from the request.
 */
export const captureActivity = async (req: Request | null, options: LogOptions) => {
  try {
    const { type, resource, resourceId, action_text, details, userId } = options;

    // Use userId from options or from req.user
    const finalUserId = userId || (req as any)?.user?._id;

    if (!finalUserId) {
      console.warn('Attempted to log activity without a user ID:', action_text);
      return;
    }

    const ip_address = req
      ? (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
      : undefined;
    const user_agent = req ? (req.headers['user-agent'] as string) : undefined;

    const logData: any = {
      action_text,
      type,
      user_id: finalUserId,
      timestamp: new Date(),
    };

    if (resource) logData.resource = resource;
    if (resourceId) logData.resource_id = resourceId;
    if (details) logData.details = details;
    if (ip_address) logData.ip_address = ip_address;
    if (user_agent) logData.user_agent = user_agent;

    const newLog = await ActivityLog.create(logData);
    const populatedLog = await newLog.populate('user_id', 'email role');

    // Emit real-time activity event via Socket.io
    const io = req?.app?.get('io');
    if (io) {
      // Keep it brief for the notification bell
      const briefMessage =
        type === 'RESTOCK'
          ? 'Stock Updated'
          : `${resource ? resource.charAt(0) + resource.slice(1).toLowerCase() : 'System'} ${type.toLowerCase()}`;

      io.emit('new_activity', {
        ...populatedLog.toObject(),
        message: briefMessage,
      });
    }
  } catch (error) {
    // don't want activity logging to crash the main request
    logger.error('Failed to capture activity log:', error);
  }
};
