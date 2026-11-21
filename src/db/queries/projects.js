const { db } = require('../connection');

function list() {
  return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
}

function insert(name, description, ownerId) {
  return db.prepare(
    'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)'
  ).run(name, description, ownerId);
}

function findById(id) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

function update(name, description, ownerId, id) {
  return db.prepare(
    'UPDATE projects SET name = ?, description = ?, owner_id = ? WHERE id = ?'
  ).run(name, description, ownerId, id);
}

function remove(id) {
  return db.prepare('DELETE FROM projects WHERE id = ?').run(id);
}

module.exports = { list, insert, findById, update, remove };
