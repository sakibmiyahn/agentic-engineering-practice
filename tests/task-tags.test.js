const request = require('supertest');
const { app, db, setupDatabase, createFixtures } = require('./helpers/database');

setupDatabase();
beforeEach(createFixtures);

describe('POST /tasks/:id/tags', () => {
  test('applies a tag with coerced identifiers', async () => {
    const res = await request(app).post('/tasks/1suffix/tags').send({ tag_id: '1suffix' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ task_id: 1, tag_id: 1 });
    expect(db.prepare('SELECT * FROM task_tags').all()).toEqual([res.body]);
    const task = await request(app).get('/tasks/1');
    expect(task.body.tags).toEqual([{ id: 1, name: 'bug' }]);
  });

  test.each([
    ['99999', {}, 404, 'Task not found'],
    ['1', {}, 400, 'tag_id is required'],
    ['1', { tag_id: 99999 }, 404, 'Tag not found']
  ])('preserves validation order for task %s and payload %j', async (id, payload, status, error) => {
    const res = await request(app).post(`/tasks/${id}/tags`).send(payload);
    expect(res.status).toBe(status);
    expect(res.body).toEqual({ error });
  });

  test('rejects duplicate associations', async () => {
    await request(app).post('/tasks/1/tags').send({ tag_id: 1 });
    const res = await request(app).post('/tasks/1/tags').send({ tag_id: 1 });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'tag already applied to this task' });
  });
});

describe('DELETE /tasks/:id/tags/:tagId', () => {
  test('removes an association without authentication', async () => {
    db.prepare('INSERT INTO task_tags VALUES (1, 1)').run();
    const res = await request(app).delete('/tasks/1suffix/tags/1suffix');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deleted: true });
    expect(db.prepare('SELECT * FROM task_tags').all()).toEqual([]);
  });

  test.each(['/tasks/99999/tags/1', '/tasks/1/tags/99999', '/tasks/invalid/tags/1'])('returns not found for an unapplied association %s', async path => {
    const res = await request(app).delete(path);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Tag not applied to this task' });
  });
});
