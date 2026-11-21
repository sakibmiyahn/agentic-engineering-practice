const request = require('supertest');
const { app, setupDatabase } = require('./helpers/database');

setupDatabase();

describe('POST /webhooks/task-update', () => {
  test.each([{}, { task_id: 1, status: 'completed' }, ['arbitrary']])('acknowledges any valid JSON payload %j without authentication', async payload => {
    const res = await request(app).post('/webhooks/task-update').send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });
    expect(console.log).toHaveBeenCalledWith('[WEBHOOK] Received:', payload);
  });

  test('rejects malformed JSON', async () => {
    const res = await request(app).post('/webhooks/task-update').set('Content-Type', 'application/json').send('{');
    expect(res.status).toBe(400);
  });

  test('forwards unexpected service failures', async () => {
    const service = require('../src/services/webhooks');
    jest.spyOn(service, 'receiveTaskUpdate').mockRejectedValueOnce(new Error('Webhook failure'));
    const res = await request(app).post('/webhooks/task-update').send({});
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Webhook failure' });
  });
});
