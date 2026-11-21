const request = require('supertest');
const { app, db, setupDatabase, createFixtures } = require('./helpers/database');

setupDatabase();
beforeEach(createFixtures);

describe('GET /tasks/:id/comments', () => {
  test('returns comments in ascending creation order with user names', async () => {
    db.prepare("INSERT INTO comments (task_id, user_id, body, created_at) VALUES (1, 1, 'later', '2026-02-01'), (1, 1, 'earlier', '2026-01-01')").run();
    const res = await request(app).get('/tasks/1/comments');
    expect(res.status).toBe(200);
    expect(res.body.map(c => c.body)).toEqual(['earlier', 'later']);
    expect(res.body[0].user_name).toBe('Test User');
  });

  test('returns an empty array for a task without comments', async () => {
    expect((await request(app).get('/tasks/1/comments')).body).toEqual([]);
  });

  test.each(['99999', 'invalid'])('returns not found for task %s', async id => {
    const res = await request(app).get(`/tasks/${id}/comments`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Task not found' });
  });
});

describe('POST /tasks/:id/comments', () => {
  test('creates a comment with a coerced user ID and the original body', async () => {
    const res = await request(app).post('/tasks/1suffix/comments').send({ user_id: '1suffix', body: '  Comment  ' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ task_id: 1, user_id: 1, body: '  Comment  ', user_name: 'Test User' });
    expect(db.prepare('SELECT body FROM comments WHERE id = ?').get(res.body.id).body).toBe('  Comment  ');
  });

  test.each([
    ['99999', {}, 404, 'Task not found'],
    ['1', {}, 400, 'body is required'],
    ['1', { body: '   ', user_id: 99999 }, 400, 'body is required'],
    ['1', { body: 'hello' }, 400, 'user_id is required'],
    ['1', { body: 'hello', user_id: 99999 }, 400, 'user not found']
  ])('preserves validation order for task %s and payload %j', async (id, payload, status, error) => {
    const res = await request(app).post(`/tasks/${id}/comments`).send(payload);
    expect(res.status).toBe(status);
    expect(res.body).toEqual({ error });
    expect(db.prepare('SELECT COUNT(*) AS count FROM comments').get().count).toBe(0);
  });
});
