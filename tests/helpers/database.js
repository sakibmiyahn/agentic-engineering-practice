process.env.NODE_ENV = 'test';

const app = require('../../src');
const { db } = require('../../src/db/connection');
const { createSchema } = require('../../src/db/schema');

function setupDatabase() {
  beforeAll(() => createSchema(db));
  beforeEach(() => {
    db.exec('DELETE FROM task_tags; DELETE FROM comments; DELETE FROM tasks; DELETE FROM projects; DELETE FROM users; DELETE FROM tags;');
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());
  afterAll(() => db.close());
}

function createFixtures() {
  db.prepare('INSERT INTO users (id, name, email) VALUES (1, ?, ?)').run('Test User', 'test@example.com');
  db.prepare('INSERT INTO projects (id, name, owner_id) VALUES (1, ?, 1)').run('Test Project');
  db.prepare('INSERT INTO tasks (id, title, project_id, assignee_id) VALUES (1, ?, 1, 1)').run('Test Task');
  db.prepare('INSERT INTO tags (id, name) VALUES (1, ?)').run('bug');
}

module.exports = { app, db, setupDatabase, createFixtures };
