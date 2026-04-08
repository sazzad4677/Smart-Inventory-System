import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../index';

// Increase timeout for integration tests (especially for MongoMemoryServer startup)
jest.setTimeout(60000);

// Mock Redis to prevent integration tests from needing a real Redis server
jest.mock('../config/redis', () => ({
  redisClient: {
    isOpen: true,
    sendCommand: jest.fn().mockResolvedValue(null),
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(null),
    quit: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(0),
  },
  connectRedis: jest.fn().mockResolvedValue(null),
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    if (collection) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

export { app };
