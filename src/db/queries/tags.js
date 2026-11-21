const { db } = require('../connection');

/**
 * @description Lists tags in ascending name order (list).
 * @returns {Array<{id: number, name: string}>} Matching rows.
 */
function list() {
  return db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
}

/**
 * @description Inserts a tag row (insert).
 * @param {string} name - Name to persist.
 * @returns {{changes: number, lastInsertRowid: number|bigint}} SQLite change count and last inserted row identifier; updates and deletes do not create a new identifier.
 */
function insert(name) {
  return db.prepare('INSERT INTO tags (name) VALUES (?)').run(name);
}

/**
 * @description Finds a tag by identifier (findById).
 * @param {number|bigint} id - SQLite row identifier.
 * @returns {{id: number, name: string}|undefined} Matching row, or undefined when absent.
 */
function findById(id) {
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
}

module.exports = { list, insert, findById };
