const request = require('supertest');
const { app, db, setupDatabase } = require('./helpers/database');

setupDatabase();

describe('GET /tags', () => {
  test('returns tags in alphabetical order', async () => {
    db.prepare("INSERT INTO tags (name) VALUES ('zebra'), ('alpha')").run();
    const res = await request(app).get('/tags');
    expect(res.status).toBe(200);
    expect(res.body.map(tag => tag.name)).toEqual(['alpha', 'zebra']);
  });

  test('returns an empty list', async () => {
    expect((await request(app).get('/tags')).body).toEqual([]);
  });
});

describe('POST /tags', () => {
  test('normalizes and persists a tag', async () => {
    const res = await request(app).post('/tags').send({ name: '  BuG  ' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('bug');
    expect(db.prepare('SELECT * FROM tags WHERE id = ?').get(res.body.id)).toEqual(res.body);
  });

  test.each([{}, { name: '   ' }, { name: 123 }])('rejects a missing or invalid name %j', async payload => {
    const res = await request(app).post('/tags').send(payload);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'name is required' });
  });

  test('rejects a duplicate after normalization', async () => {
    await request(app).post('/tags').send({ name: 'bug' });
    const res = await request(app).post('/tags').send({ name: ' BUG ' });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'tag already exists' });
  });
});
