import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import prisma from '../config/prisma';

interface ClientEventInput {
  eventName?: string;
  createdAt?: string | Date;
}

export const trackClientEvents = catchAsync(async (req: Request, res: Response) => {
  const events = req.body.events as ClientEventInput[];

  if (Array.isArray(events) && events.length > 0) {
    // Map events to Prisma schema
    const data = events.map((e: ClientEventInput) => ({
      event: e.eventName || 'unknown',
      timestamp: e.createdAt ? new Date(e.createdAt) : new Date(),
    }));

    await prisma.clientEvent.createMany({
      data,
    });
  }

  res.status(200).json({ success: true, message: 'Events tracked successfully' });
});

export const getMetrics = catchAsync(async (req: Request, res: Response) => {
  // Simple metrics endpoint using Prisma
  const totalApiMetrics = await prisma.apiMetric.count();

  // Slow requests (> 500ms)
  const slowRequests = await prisma.apiMetric.count({
    where: { duration: { gt: 500 } },
  });

  const totalClientEvents = await prisma.clientEvent.count();

  // Calculate average response time
  const aggregate = await prisma.apiMetric.aggregate({
    _avg: {
      duration: true,
    },
  });

  const avgResponseTime = aggregate._avg.duration || 0;

  res.status(200).json({
    success: true,
    data: {
      api: {
        totalRequestsLog: totalApiMetrics,
        slowRequests,
        averageResponseTimeMs: Math.round(avgResponseTime),
      },
      client: {
        totalEventsLog: totalClientEvents,
      },
    },
  });
});
