const request = require('supertest');
const { app, db, setupDatabase } = require('./helpers/database');

setupDatabase();

beforeEach(() => {
  db.prepare('INSERT INTO users (id, name, email) VALUES (1, ?, ?)').run('Project Owner', 'owner@test.com');
});

describe('Project endpoints', () => {
  test('POST /projects creates a project', async () => {
    const res = await request(app)
      .post('/projects')
      .send({ name: 'My Project', description: 'A test project', owner_id: 1 });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('My Project');
    expect(res.body.id).toBeDefined();
  });

  test('POST /projects returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/projects')
      .send({ description: 'No name' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('GET /projects returns all projects', async () => {
    await request(app).post('/projects').send({ name: 'Alpha' });
    await request(app).post('/projects').send({ name: 'Beta' });
    const res = await request(app).get('/projects');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('GET /projects/:id returns project with stats', async () => {
    const created = await request(app)
      .post('/projects')
      .send({ name: 'Stats Project' });
    const projectId = created.body.id;

    await request(app).post('/tasks').send({ title: 'Active task', project_id: projectId });
    await request(app).post('/tasks').send({ title: 'Another active', project_id: projectId });

    const res = await request(app).get(`/projects/${projectId}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Stats Project');
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.total).toBe(2);
    expect(res.body.stats.active).toBe(2);
  });

  test('GET /projects/:id returns 404 for unknown project', async () => {
    const res = await request(app).get('/projects/99999');
    expect(res.status).toBe(404);
  });

  test('tasks can be assigned to a project', async () => {
    const proj = await request(app).post('/projects').send({ name: 'Assignment Test' });
    const projectId = proj.body.id;

    await request(app).post('/tasks').send({ title: 'Task in project', project_id: projectId });
    await request(app).post('/tasks').send({ title: 'Unassigned task' });

    const res = await request(app).get(`/tasks?project_id=${projectId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Task in project');
  });

  test('PUT /projects/:id updates a project', async () => {
    const created = await request(app)
      .post('/projects')
      .send({ name: 'Old Name' });
    const res = await request(app)
      .put(`/projects/${created.body.id}`)
      .send({ name: 'New Name', description: 'Updated desc' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New Name');
    expect(res.body.description).toBe('Updated desc');
  });

  test('DELETE /projects/:id removes a project', async () => {
    const created = await request(app).post('/projects').send({ name: 'Doomed Project' });
    const projectId = created.body.id;

    const res = await request(app)
      .delete(`/projects/${projectId}`)
      .set('x-api-key', 'dev-key');
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);

    const check = await request(app).get(`/projects/${projectId}`);
    expect(check.status).toBe(404);
  });
});

describe('POST /projects compatibility', () => {
  test.each([{ name: '   ' }, { name: 123 }])('rejects invalid names %j', async payload => {
    const res = await request(app).post('/projects').send(payload);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'name is required' });
  });

  test('preserves whitespace and converts falsey optional fields to null', async () => {
    const res = await request(app).post('/projects').send({ name: '  Name  ', description: '', owner_id: 0 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: '  Name  ', description: null, owner_id: null });
  });

  test('forwards foreign key failures', async () => {
    const res = await request(app).post('/projects').send({ name: 'Project', owner_id: 99999 });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'FOREIGN KEY constraint failed' });
  });
});

describe('GET /projects/:id compatibility', () => {
  test('returns all status totals and coerces numeric prefixes', async () => {
    db.prepare("INSERT INTO projects (id, name) VALUES (1, 'Project')").run();
    db.prepare("INSERT INTO tasks (title, project_id, status) VALUES ('A', 1, 'active'), ('B', 1, 'completed'), ('C', 1, 'archived')").run();
    const res = await request(app).get('/projects/1suffix');
    expect(res.status).toBe(200);
    expect(res.body.stats).toEqual({ total: 3, active: 1, completed: 1, archived: 1 });
    expect((await request(app).get('/projects/invalid')).body).toEqual({ error: 'Project not found' });
  });
});

describe('PUT /projects/:id compatibility', () => {
  beforeEach(() => db.prepare("INSERT INTO projects (id, name, description, owner_id) VALUES (1, 'Project', 'Description', 1)").run());

  test('allows a blank name and explicit nullable fields', async () => {
    const res = await request(app).put('/projects/1suffix').send({ name: '', description: null, owner_id: null });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: '', description: null, owner_id: null });
  });

  test('checks existence before update constraints', async () => {
    const res = await request(app).put('/projects/99999').send({ name: null });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Project not found' });
  });

  test.each([
    [{ name: null }, 'NOT NULL constraint failed: projects.name'],
    [{ owner_id: 99999 }, 'FOREIGN KEY constraint failed']
  ])('preserves constraint failure and persistence for %j', async (payload, error) => {
    const res = await request(app).put('/projects/1').send(payload);
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error });
    expect(db.prepare('SELECT name FROM projects WHERE id = 1').get().name).toBe('Project');
  });
});

describe('DELETE /projects/:id compatibility', () => {
  test.each([undefined, 'wrong-key'])('requires authentication before lookup', async key => {
    const req = request(app).delete('/projects/99999');
    if (key) req.set('x-api-key', key);
    const res = await req;
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  test('returns not found with valid authentication', async () => {
    const res = await request(app).delete('/projects/99999').set('x-api-key', 'dev-key');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Project not found' });
  });

  test('keeps a project with dependent tasks', async () => {
    db.prepare("INSERT INTO projects (id, name) VALUES (1, 'Project')").run();
    db.prepare("INSERT INTO tasks (title, project_id) VALUES ('Task', 1)").run();
    const res = await request(app).delete('/projects/1').set('x-api-key', 'dev-key');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'FOREIGN KEY constraint failed' });
    expect(db.prepare('SELECT id FROM projects WHERE id = 1').get()).toBeDefined();
  });
});
