const request = require('supertest');
const { app, db, setupDatabase } = require('./helpers/database');

setupDatabase();

beforeEach(() => {
  db.prepare('INSERT INTO users (id, name, email) VALUES (1, ?, ?)').run('Test User', 'test@example.com');
  db.prepare('INSERT INTO projects (id, name) VALUES (1, ?)').run('Test Project');
});

describe('GET /tasks', () => {
  test('returns empty array when no tasks', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns all tasks', async () => {
    db.prepare("INSERT INTO tasks (title, status) VALUES ('Task A', 'active')").run();
    db.prepare("INSERT INTO tasks (title, status) VALUES ('Task B', 'completed')").run();
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('filters by ?status=active', async () => {
    db.prepare("INSERT INTO tasks (title, status) VALUES ('Active Task', 'active')").run();
    db.prepare("INSERT INTO tasks (title, status) VALUES ('Done Task', 'completed')").run();
    const res = await request(app).get('/tasks?status=active');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Active Task');
  });

  test('filters by ?status=completed', async () => {
    db.prepare("INSERT INTO tasks (title, status) VALUES ('Active Task', 'active')").run();
    db.prepare("INSERT INTO tasks (title, status) VALUES ('Done Task', 'completed')").run();
    const res = await request(app).get('/tasks?status=completed');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Done Task');
  });

  test('returns 400 for invalid status value', async () => {
    const res = await request(app).get('/tasks?status=invalid');
    expect(res.status).toBe(400);
  });
});

describe('POST /tasks', () => {
  test('creates a task with valid data', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'New Task', description: 'Do the thing' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New Task');
    expect(res.body.status).toBe('active');
    expect(res.body.id).toBeDefined();
  });

  test('creates a task assigned to a project', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Project Task', project_id: 1 });
    expect(res.status).toBe(201);
    expect(res.body.project_id).toBe(1);
  });

  test('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ description: 'No title here' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('returns 400 when title is empty string', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: '   ' });
    expect(res.status).toBe(400);
  });
});

describe('GET /tasks/:id', () => {
  test('returns task by id', async () => {
    const result = db.prepare("INSERT INTO tasks (title) VALUES ('Find Me')").run();
    const res = await request(app).get(`/tasks/${result.lastInsertRowid}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Find Me');
    expect(res.body.tags).toBeDefined();
    expect(res.body.comments).toBeDefined();
  });

  test('returns 404 for unknown id', async () => {
    const res = await request(app).get('/tasks/99999');
    expect(res.status).toBe(404);
  });
});

describe('PUT /tasks/:id', () => {
  test('updates task status to completed', async () => {
    const result = db.prepare("INSERT INTO tasks (title, status) VALUES ('Update Me', 'active')").run();
    const taskId = result.lastInsertRowid;
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .send({ status: 'completed' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
    expect(res.body.completed_at).not.toBeNull();
  });

  test('updates task title', async () => {
    const result = db.prepare("INSERT INTO tasks (title) VALUES ('Old Title')").run();
    const taskId = result.lastInsertRowid;
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .send({ title: 'New Title' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('New Title');
  });

  test('returns 404 for unknown id', async () => {
    const res = await request(app).put('/tasks/99999').send({ title: 'Ghost' });
    expect(res.status).toBe(404);
  });

  test('returns 400 for invalid status', async () => {
    const result = db.prepare("INSERT INTO tasks (title) VALUES ('Status Test')").run();
    const res = await request(app)
      .put(`/tasks/${result.lastInsertRowid}`)
      .send({ status: 'bogus' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /tasks/:id', () => {
  test('deletes a task', async () => {
    const result = db.prepare("INSERT INTO tasks (title) VALUES ('Delete Me')").run();
    const taskId = result.lastInsertRowid;
    const res = await request(app).delete(`/tasks/${taskId}`);
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);

    const check = await request(app).get(`/tasks/${taskId}`);
    expect(check.status).toBe(404);
  });

  test('returns 404 when task does not exist', async () => {
    const res = await request(app).delete('/tasks/99999');
    expect(res.status).toBe(404);
  });
});

describe('GET /tasks compatibility', () => {
  beforeEach(() => {
    const insert = db.prepare('INSERT INTO tasks (title, project_id, assignee_id, created_at) VALUES (?, ?, ?, ?)');
    for (let i = 1; i <= 25; i++) insert.run(`Task ${i}`, i % 2 ? 1 : null, i % 2 ? 1 : null, `2026-01-${String(i).padStart(2, '0')}`);
  });

  test('uses default pagination in descending creation order', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(20);
    expect(res.body[0].title).toBe('Task 25');
  });

  test('filters by coerced project and assignee IDs', async () => {
    const res = await request(app).get('/tasks?project_id=1suffix&assignee_id=1suffix');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(13);
    expect(res.body.every(task => task.project_id === 1 && task.assignee_id === 1)).toBe(true);
  });

  test('preserves falsey and nonnumeric filter behavior', async () => {
    const res = await request(app).get('/tasks?project_id=invalid&assignee_id=0&page_size=0&page=0');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(20);
  });

  test('preserves pagination coercion and negative values', async () => {
    const res = await request(app).get('/tasks?page_size=2suffix&page=2suffix');
    expect(res.status).toBe(200);
    expect(res.body.map(task => task.title)).toEqual(['Task 23', 'Task 22']);
    const negative = await request(app).get('/tasks?page_size=-1&page=-1');
    expect(negative.status).toBe(200);
    expect(negative.body).toHaveLength(23);
  });

  test.each(['bogus', 'ACTIVE'])('preserves the invalid status message for %s', async status => {
    const res = await request(app).get(`/tasks?status=${status}`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'status must be one of: active, completed, archived' });
  });
});

describe('POST /tasks compatibility', () => {
  test.each([
    [{ project_id: 99999, assignee_id: 99999 }, 'title is required'],
    [{ title: 'Task', project_id: 99999, assignee_id: 99999 }, 'project not found'],
    [{ title: 'Task', assignee_id: 99999 }, 'assignee not found']
  ])('preserves validation precedence for %j', async (payload, error) => {
    const res = await request(app).post('/tasks').send(payload);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error });
    expect(db.prepare('SELECT COUNT(*) AS count FROM tasks').get().count).toBe(0);
  });

  test('coerces IDs, preserves title whitespace and ignores input status', async () => {
    const res = await request(app).post('/tasks').send({ title: '  Task  ', project_id: '1suffix', assignee_id: '1suffix', status: 'completed', description: '', due_date: '' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: '  Task  ', project_id: 1, assignee_id: 1, status: 'active', description: null, due_date: null, completed_at: null });
  });
});

describe('GET /tasks/:id compatibility', () => {
  test('returns nested comments and tags only on detail responses', async () => {
    db.prepare("INSERT INTO tasks (id, title) VALUES (1, 'Task')").run();
    db.prepare("INSERT INTO comments (task_id, user_id, body) VALUES (1, 1, 'Comment')").run();
    db.prepare("INSERT INTO tags (id, name) VALUES (1, 'bug')").run();
    db.prepare('INSERT INTO task_tags VALUES (1, 1)').run();
    const res = await request(app).get('/tasks/1suffix');
    expect(res.status).toBe(200);
    expect(res.body.tags).toEqual([{ id: 1, name: 'bug' }]);
    expect(res.body.comments[0]).toMatchObject({ body: 'Comment', user_name: 'Test User' });
    expect((await request(app).get('/tasks')).body[0].tags).toBeUndefined();
  });

  test('returns not found for a nonnumeric identifier', async () => {
    const res = await request(app).get('/tasks/invalid');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Task not found' });
  });
});

describe('PUT /tasks/:id compatibility', () => {
  beforeEach(() => db.prepare("INSERT INTO tasks (id, title) VALUES (1, 'Task')").run());

  test('preserves completion time until reopened and clears it on reopening', async () => {
    const completed = await request(app).put('/tasks/1').send({ status: 'completed' });
    expect(completed.status).toBe(200);
    expect(new Date(completed.body.completed_at).toISOString()).toBe(completed.body.completed_at);
    const repeated = await request(app).put('/tasks/1').send({ status: 'completed', title: 'Updated' });
    expect(repeated.body.completed_at).toBe(completed.body.completed_at);
    const reopened = await request(app).put('/tasks/1').send({ status: 'active' });
    expect(reopened.body.completed_at).toBeNull();
    const archived = await request(app).put('/tasks/1').send({ status: 'archived' });
    expect(archived.body.completed_at).toBeNull();
  });

  test('allows blank title, null status and nullable fields', async () => {
    const res = await request(app).put('/tasks/1suffix').send({ title: '', status: null, description: null, project_id: null, assignee_id: null, due_date: null });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ title: '', status: null, description: null, project_id: null, assignee_id: null, due_date: null, completed_at: null });
  });

  test('checks existence before status validation', async () => {
    const res = await request(app).put('/tasks/99999').send({ status: 'bogus' });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Task not found' });
  });

  test.each([
    [{ title: null }, 'NOT NULL constraint failed: tasks.title'],
    [{ project_id: 99999 }, 'FOREIGN KEY constraint failed'],
    [{ assignee_id: 99999 }, 'FOREIGN KEY constraint failed']
  ])('preserves constraint failures for %j', async (payload, error) => {
    const res = await request(app).put('/tasks/1').send(payload);
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error });
    expect(db.prepare('SELECT title FROM tasks WHERE id = 1').get().title).toBe('Task');
  });
});

describe('DELETE /tasks/:id compatibility', () => {
  test('keeps tasks with dependent comments', async () => {
    db.prepare("INSERT INTO tasks (id, title) VALUES (1, 'Task')").run();
    db.prepare("INSERT INTO comments (task_id, user_id, body) VALUES (1, 1, 'Comment')").run();
    const res = await request(app).delete('/tasks/1');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'FOREIGN KEY constraint failed' });
    expect(db.prepare('SELECT id FROM tasks WHERE id = 1').get()).toBeDefined();
  });

  test('returns not found for a nonnumeric identifier', async () => {
    const res = await request(app).delete('/tasks/invalid');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Task not found' });
  });
});
