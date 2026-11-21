const request = require('supertest');
const { app, setupDatabase } = require('./helpers/database');

setupDatabase();

describe('GET /', () => {
  test('returns the API identity', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ name: 'Taskr API', version: '1.0.0', docs: '/health' });
  });
});

describe('GET /health', () => {
  test('returns health and an ISO timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});

describe('Request errors', () => {
  test('preserves the JSON parser status and message', async () => {
    const res = await request(app).post('/tasks').set('Content-Type', 'application/json').send('{');
    expect(res.status).toBe(400);
    expect(res.body.error).toEqual(expect.any(String));
  });

  test('keeps unknown routes as not found', async () => {
    expect((await request(app).get('/unknown')).status).toBe(404);
  });
});
