const { db } = require('../connection');

function list() {
  return db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
}

function insert(name) {
  return db.prepare('INSERT INTO tags (name) VALUES (?)').run(name);
}

function findById(id) {
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
}

module.exports = { list, insert, findById };
