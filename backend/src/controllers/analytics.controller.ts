import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import ClientEvent from '../models/ClientEvent.model';
import ApiMetric from '../models/ApiMetric.model';

export const trackClientEvents = catchAsync(async (req: Request, res: Response) => {
  const events = req.body.events;

  if (Array.isArray(events) && events.length > 0) {
    // Add server-side timestamp or enrich data if necessary
    // Bulk insert to handle many events at once
    await ClientEvent.insertMany(events);
  }

  res.status(200).json({ success: true, message: 'Events tracked successfully' });
});

export const getMetrics = catchAsync(async (req: Request, res: Response) => {
  // Simple metrics endpoint: returns average response time, slow requests count, total event count
  // In a real app, you'd add date filters and aggregation pipelines.

  const totalApiMetrics = await ApiMetric.countDocuments();
  const slowRequests = await ApiMetric.countDocuments({ responseTime: { $gt: 500 } });

  const totalClientEvents = await ClientEvent.countDocuments();

  // Calculate average response time
  const avgResponseTimeAggr = await ApiMetric.aggregate([
    { $group: { _id: null, avgTime: { $avg: '$responseTime' } } },
  ]);

  const avgResponseTime = avgResponseTimeAggr.length > 0 ? avgResponseTimeAggr[0].avgTime : 0;

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
