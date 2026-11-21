const { db } = require('../connection');

function insert(name, email) {
  return db.prepare(
    'INSERT INTO users (name, email) VALUES (?, ?)'
  ).run(name, email);
}

function findById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function update(name, email, id) {
  return db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, id);
}

function remove(id) {
  return db.prepare('DELETE FROM users WHERE id = ?').run(id);
}

function list() {
  return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
}

module.exports = { insert, findById, update, remove, list };
