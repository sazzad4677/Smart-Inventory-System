import request from 'supertest';
import { app } from '../index';

describe('Health Check API', () => {
  it('GET /health should return 200 with server status ok', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      message: 'Server is running',
    });
  });
});
