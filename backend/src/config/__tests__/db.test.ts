import connectDB from '../db';
import mongoose from 'mongoose';
import * as performancePlugin from '../mongoosePerformancePlugin';

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({
    connection: { host: 'localhost' },
  }),
  set: jest.fn(),
  connection: {
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(true),
  },
}));

// Mock other dependencies
jest.mock('../mongoosePerformancePlugin');
jest.mock('../../utils/logger');

describe('db.ts - connectDB', () => {
  it('should call mongoose.connect and apply performance plugin', async () => {
    await connectDB();
    expect(mongoose.connect).toHaveBeenCalled();
    expect(performancePlugin.applyMongoosePerformancePlugin).toHaveBeenCalled();
  });
});
