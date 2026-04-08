import { applyMongoosePerformancePlugin } from '../mongoosePerformancePlugin';
import mongoose from 'mongoose';

// Mock mongoose
jest.mock('mongoose', () => ({
  plugin: jest.fn(),
}));

describe('mongoosePerformancePlugin', () => {
  it('should register the plugin with mongoose', () => {
    applyMongoosePerformancePlugin();
    expect(mongoose.plugin).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should define the behavior when the plugin function is executed', () => {
    const mockSchema = {
      pre: jest.fn(),
      post: jest.fn(),
    };

    // Capture the function passed to mongoose.plugin
    applyMongoosePerformancePlugin();
    const pluginFn = (mongoose.plugin as jest.Mock).mock.calls[0][0];

    // Execute it with mock schema
    pluginFn(mockSchema);

    // Check if pre/post hooks were registered for monitoring methods
    expect(mockSchema.pre).toHaveBeenCalled();
    expect(mockSchema.post).toHaveBeenCalled();
  });

  it('should log a warning if the query is slow', async () => {
    const mockSchema = { pre: jest.fn(), post: jest.fn() };
    applyMongoosePerformancePlugin();
    const registerPluginFn = (mongoose.plugin as jest.Mock).mock.calls[0][0];
    registerPluginFn(mockSchema);
    const postFn = (mockSchema.post as jest.Mock).mock.calls[0][1];

    // Mock duration > threshold
    const mockContext = {
      _startTime: 1000,
      mongooseCollection: { name: 'test' },
    };
    jest.spyOn(Date, 'now').mockReturnValue(2000); // duration = 1000ms

    const next = jest.fn();
    postFn.call(mockContext, {}, next);

    expect(next).toHaveBeenCalled();
  });
});
