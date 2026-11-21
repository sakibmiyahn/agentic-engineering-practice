jest.mock('../src/services/notifications', () => ({
  sendWelcomeEmail: jest.fn(() => Promise.resolve({ sent: true }))
}));

const request = require('supertest');
const { sendWelcomeEmail } = require('../src/services/notifications');
const { app, db, setupDatabase } = require('./helpers/database');

setupDatabase();

beforeEach(() => sendWelcomeEmail.mockClear());

describe('User endpoints', () => {
  test('GET /users returns empty array when no users exist', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('POST /users creates a user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Alice Chen', email: 'alice@test.com' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Alice Chen');
    expect(res.body.email).toBe('alice@test.com');
    expect(res.body.id).toBeDefined();
  });

  test('POST /users returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/users')
      .send({ email: 'noname@test.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('POST /users returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'No Email' });
    expect(res.status).toBe(400);
  });

  test('POST /users returns 409 when email already exists', async () => {
    await request(app).post('/users').send({ name: 'Alice', email: 'dup@test.com' });
    const res = await request(app).post('/users').send({ name: 'Alice Again', email: 'dup@test.com' });
    expect(res.status).toBe(409);
  });

  test('GET /users/:id returns user', async () => {
    const created = await request(app)
      .post('/users')
      .send({ name: 'Bob', email: 'bob@test.com' });
    const res = await request(app).get(`/users/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Bob');
  });

  test('GET /users/:id returns 404 for unknown user', async () => {
    const res = await request(app).get('/users/99999');
    expect(res.status).toBe(404);
  });

  test('PUT /users/:id updates user name', async () => {
    const created = await request(app)
      .post('/users')
      .send({ name: 'Old Name', email: 'update@test.com' });
    const res = await request(app)
      .put(`/users/${created.body.id}`)
      .send({ name: 'New Name' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New Name');
    expect(res.body.email).toBe('update@test.com');
  });

  test('DELETE /users/:id removes user', async () => {
    const created = await request(app)
      .post('/users')
      .send({ name: 'Delete Me', email: 'deleteme@test.com' });
    const userId = created.body.id;

    // DELETE requires auth header
    const res = await request(app)
      .delete(`/users/${userId}`)
      .set('x-api-key', 'dev-key');
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);

    const check = await request(app).get(`/users/${userId}`);
    expect(check.status).toBe(404);
  });

  test('GET /users returns all users', async () => {
    await request(app).post('/users').send({ name: 'User One', email: 'one@test.com' });
    await request(app).post('/users').send({ name: 'User Two', email: 'two@test.com' });
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('POST /users compatibility', () => {
  test.each([
    [{}, 'name is required'],
    [{ name: ' ' }, 'name is required'],
    [{ name: 'Name', email: 123 }, 'email is required'],
    [{ name: 'Name', email: 'invalid' }, 'Invalid email address']
  ])('preserves validation precedence for %j', async (payload, error) => {
    const res = await request(app).post('/users').send(payload);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error });
    expect(db.prepare('SELECT COUNT(*) AS count FROM users').get().count).toBe(0);
  });

  test('keeps the user persisted when email delivery fails', async () => {
    sendWelcomeEmail.mockRejectedValueOnce(new Error('Email delivery failed'));
    const res = await request(app).post('/users').send({ name: 'Email User', email: 'email@test.com' });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Email delivery failed' });
    expect(db.prepare('SELECT name FROM users WHERE email = ?').get('email@test.com')).toEqual({ name: 'Email User' });
    const retry = await request(app).post('/users').send({ name: 'Email User', email: 'email@test.com' });
    expect(retry.status).toBe(409);
    expect(retry.body).toEqual({ error: 'email already exists' });
  });
});

describe('GET /users/:id compatibility', () => {
  test('coerces numeric prefixes and rejects nonnumeric identifiers', async () => {
    db.prepare("INSERT INTO users (id, name, email) VALUES (1, 'User', 'user@test.com')").run();
    expect((await request(app).get('/users/1suffix')).body.name).toBe('User');
    const res = await request(app).get('/users/invalid');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'User not found' });
  });
});

describe('PUT /users/:id compatibility', () => {
  beforeEach(() => {
    db.prepare("INSERT INTO users (id, name, email) VALUES (1, 'Original', 'original@test.com'), (2, 'Other', 'other@test.com')").run();
  });

  test('allows blank names and unvalidated email on update', async () => {
    const res = await request(app).put('/users/1suffix').send({ name: '', email: 'invalid' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, name: '', email: 'invalid' });
  });

  test('checks existence before validating update fields', async () => {
    const res = await request(app).put('/users/99999').send({ name: null });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'User not found' });
  });

  test.each([
    [{ email: 'other@test.com' }, 'UNIQUE constraint failed: users.email'],
    [{ name: null }, 'NOT NULL constraint failed: users.name']
  ])('preserves database errors and the existing row for %j', async (payload, error) => {
    const res = await request(app).put('/users/1').send(payload);
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error });
    expect(db.prepare('SELECT name, email FROM users WHERE id = 1').get()).toEqual({ name: 'Original', email: 'original@test.com' });
  });
});

describe('DELETE /users/:id compatibility', () => {
  test.each([undefined, 'wrong-key'])('rejects an unauthorized request before resource lookup', async key => {
    const req = request(app).delete('/users/99999');
    if (key) req.set('x-api-key', key);
    const res = await req;
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  test('returns not found with valid authentication', async () => {
    const res = await request(app).delete('/users/99999').set('x-api-key', 'dev-key');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'User not found' });
  });

  test('does not delete a referenced user', async () => {
    db.prepare("INSERT INTO users (id, name, email) VALUES (1, 'Owner', 'owner@test.com')").run();
    db.prepare("INSERT INTO projects (name, owner_id) VALUES ('Project', 1)").run();
    const res = await request(app).delete('/users/1').set('x-api-key', 'dev-key');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'FOREIGN KEY constraint failed' });
    expect(db.prepare('SELECT id FROM users WHERE id = 1').get()).toBeDefined();
  });

  test('honors a configured API key', async () => {
    const previous = process.env.API_KEY;
    process.env.API_KEY = 'custom-key';
    try {
      expect((await request(app).delete('/users/99999').set('x-api-key', 'dev-key')).status).toBe(401);
      expect((await request(app).delete('/users/99999').set('x-api-key', 'custom-key')).status).toBe(404);
    } finally {
      if (previous === undefined) delete process.env.API_KEY;
      else process.env.API_KEY = previous;
    }
  });
});
