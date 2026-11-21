const { db } = require('../connection');

/**
 * @description Lists task comments with author names in ascending creation order (listForTask).
 * @param {number|bigint} taskId - SQLite row identifier.
 * @returns {Array<{id: number, task_id: number|null, user_id: number|null, body: string, created_at: string|null, user_name: string}>} Matching rows.
 */
function listForTask(taskId) {
  return db.prepare(
    'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id WHERE c.task_id = ? ORDER BY c.created_at ASC'
  ).all(taskId);
}

/**
 * @description Inserts a comment row (insert).
 * @param {number|bigint} taskId - SQLite row identifier.
 * @param {number|bigint} userId - SQLite row identifier.
 * @param {string} body - Comment body to persist.
 * @returns {{changes: number, lastInsertRowid: number|bigint}} SQLite change count and last inserted row identifier; updates and deletes do not create a new identifier.
 */
function insert(taskId, userId, body) {
  return db.prepare(
    'INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)'
  ).run(taskId, userId, body);
}

/**
 * @description Finds a comment by identifier with its author name (findById).
 * @param {number|bigint} id - SQLite row identifier.
 * @returns {{id: number, task_id: number|null, user_id: number|null, body: string, created_at: string|null, user_name: string}|undefined} Matching row, or undefined when absent.
 */
function findById(id) {
  return db.prepare(
    'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = ?'
  ).get(id);
}

module.exports = { listForTask, insert, findById };
