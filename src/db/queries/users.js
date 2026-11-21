const { db } = require('../connection');

/**
 * @description Inserts a user row (insert).
 * @param {string} name - Name to persist.
 * @param {string} email - Email address to persist.
 * @returns {{changes: number, lastInsertRowid: number|bigint}} SQLite change count and last inserted row identifier; updates and deletes do not create a new identifier.
 */
function insert(name, email) {
  return db.prepare(
    'INSERT INTO users (name, email) VALUES (?, ?)'
  ).run(name, email);
}

/**
 * @description Finds a user by identifier (findById).
 * @param {number|bigint} id - SQLite row identifier.
 * @returns {{id: number, name: string, email: string, created_at: string|null}|undefined} Matching row, or undefined when absent.
 */
function findById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

/**
 * @description Updates a user row (update).
 * @param {string} name - Name to persist.
 * @param {string} email - Email address to persist.
 * @param {number|bigint} id - SQLite row identifier.
 * @returns {{changes: number, lastInsertRowid: number|bigint}} SQLite change count and last inserted row identifier; updates and deletes do not create a new identifier.
 */
function update(name, email, id) {
  return db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, id);
}

/**
 * @description Deletes a user row (remove).
 * @param {number|bigint} id - SQLite row identifier.
 * @returns {{changes: number, lastInsertRowid: number|bigint}} SQLite change count and last inserted row identifier; updates and deletes do not create a new identifier.
 */
function remove(id) {
  return db.prepare('DELETE FROM users WHERE id = ?').run(id);
}

/**
 * @description Lists users in descending creation order (list).
 * @returns {Array<{id: number, name: string, email: string, created_at: string|null}>} Matching rows.
 */
function list() {
  return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
}

module.exports = { insert, findById, update, remove, list };
