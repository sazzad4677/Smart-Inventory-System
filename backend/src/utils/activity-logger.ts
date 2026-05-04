import { Request } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { ActivityType, AuthenticatedRequest } from '../types';
import { logger } from './logger';

interface LogOptions {
  type: ActivityType;
  resource?: string;
  resourceId?: string;
  action_text: string;
  details?: Record<string, unknown>;
  userId?: string;
}

/**
 * Robust activity logger that automatically captures IP and User-Agent from the request.
 * Logs are stored in the database and emitted via Socket.io for real-time updates.
 */
export const captureActivity = async (req: Request | null, options: LogOptions) => {
  try {
    const { type, resource, resourceId, action_text, details, userId } = options;

    const finalUserId = userId || (req as AuthenticatedRequest | null)?.user?.id;

    if (!finalUserId) {
      console.warn('Attempted to log activity without a user ID:', action_text);
      return;
    }

    const ip_address = req
      ? (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
      : undefined;
    const user_agent = req ? (req.headers['user-agent'] as string) : undefined;

    const logData: Prisma.ActivityLogCreateInput = {
      action_text,
      type,
      user: { connect: { id: finalUserId } },
      timestamp: new Date(),
    };

    if (resource) logData.resource = resource;
    if (resourceId) logData.resource_id = resourceId;
    if (details) logData.details = details as Prisma.InputJsonValue;
    if (ip_address) logData.ip_address = ip_address;
    if (user_agent) logData.user_agent = user_agent;

    const populatedLog = await prisma.activityLog.create({
      data: logData,
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    const io = req?.app?.get('io');
    if (io) {
      // Format a brief message for frontend notification bell
      const briefMessage =
        type === ActivityType.RESTOCK
          ? 'Stock Updated'
          : `${resource ? resource.charAt(0) + resource.slice(1).toLowerCase() : 'System'} ${type.toLowerCase()}`;

      io.emit('new_activity', {
        ...populatedLog,
        message: briefMessage,
      });
    }
  } catch (error) {
    // Prevent activity logging failures from crashing the main request thread
    logger.error('Failed to capture activity log:', error);
  }
};
