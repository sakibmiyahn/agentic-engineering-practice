const { db } = require('../connection');

/**
 * @description Lists projects in descending creation order (list).
 * @returns {Array<{id: number, name: string, description: string|null, owner_id: number|null, created_at: string|null}>} Matching rows.
 */
function list() {
  return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
}

/**
 * @description Inserts a project row (insert).
 * @param {string} name - Name to persist.
 * @param {string|null} description - Description text or null.
 * @param {number|string|null} ownerId - Project owner identifier or null.
 * @returns {{changes: number, lastInsertRowid: number|bigint}} SQLite change count and last inserted row identifier; updates and deletes do not create a new identifier.
 */
function insert(name, description, ownerId) {
  return db.prepare(
    'INSERT INTO projects (name, description, owner_id) VALUES (?, ?, ?)'
  ).run(name, description, ownerId);
}

/**
 * @description Finds a project by identifier (findById).
 * @param {number|bigint} id - SQLite row identifier.
 * @returns {{id: number, name: string, description: string|null, owner_id: number|null, created_at: string|null}|undefined} Matching row, or undefined when absent.
 */
function findById(id) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}

/**
 * @description Updates a project row (update).
 * @param {string} name - Name to persist.
 * @param {string|null} description - Description text or null.
 * @param {number|string|null} ownerId - Project owner identifier or null.
 * @param {number|bigint} id - SQLite row identifier.
 * @returns {{changes: number, lastInsertRowid: number|bigint}} SQLite change count and last inserted row identifier; updates and deletes do not create a new identifier.
 */
function update(name, description, ownerId, id) {
  return db.prepare(
    'UPDATE projects SET name = ?, description = ?, owner_id = ? WHERE id = ?'
  ).run(name, description, ownerId, id);
}

/**
 * @description Deletes a project row (remove).
 * @param {number|bigint} id - SQLite row identifier.
 * @returns {{changes: number, lastInsertRowid: number|bigint}} SQLite change count and last inserted row identifier; updates and deletes do not create a new identifier.
 */
function remove(id) {
  return db.prepare('DELETE FROM projects WHERE id = ?').run(id);
}

module.exports = { list, insert, findById, update, remove };
