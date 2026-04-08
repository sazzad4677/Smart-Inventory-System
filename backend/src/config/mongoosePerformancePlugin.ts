import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const SLOW_QUERY_THRESHOLD_MS = 200; // Log queries taking longer than 200ms

export const applyMongoosePerformancePlugin = () => {
  mongoose.plugin((schema: mongoose.Schema) => {
    // Array of query methods we want to monitor
    const monitorEvents = [
      'find',
      'findOne',
      'findOneAndUpdate',
      'updateMany',
      'updateOne',
      'save',
      'countDocuments',
      'aggregate',
    ];

    monitorEvents.forEach((event) => {
      (schema as any).pre(event, function (this: any, next: any) {
        this._startTime = Date.now();
        next();
      });

      (schema as any).post(event, function (this: any, res: any, next: any) {
        if (this._startTime) {
          const duration = Date.now() - this._startTime;
          if (duration >= SLOW_QUERY_THRESHOLD_MS) {
            const collectionName = (this as any).mongooseCollection?.name || 'unknown_collection';
            const queryName = event;
            logger.warn(`SLOW DB QUERY: ${collectionName}.${queryName} took ${duration}ms`);
          }
        }
        next();
      });
    });
  });
};
