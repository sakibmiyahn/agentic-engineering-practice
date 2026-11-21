const { db } = require('../connection');

/**
 * @description Inserts a task-tag association (insert).
 * @param {number|bigint} taskId - SQLite row identifier.
 * @param {number|bigint} tagId - SQLite row identifier.
 * @returns {{changes: number, lastInsertRowid: number|bigint}} SQLite change count and last inserted row identifier; updates and deletes do not create a new identifier.
 */
function insert(taskId, tagId) {
  return db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskId, tagId);
}

/**
 * @description Deletes a task-tag association (remove).
 * @param {number|bigint} taskId - SQLite row identifier.
 * @param {number|bigint} tagId - SQLite row identifier.
 * @returns {{changes: number, lastInsertRowid: number|bigint}} SQLite change count and last inserted row identifier; updates and deletes do not create a new identifier.
 */
function remove(taskId, tagId) {
  return db.prepare(
    'DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?'
  ).run(taskId, tagId);
}

/**
 * @description Lists tags applied to a task (listForTask).
 * @param {number|bigint} taskId - SQLite row identifier.
 * @returns {Array<{id: number, name: string}>} Matching rows.
 */
function listForTask(taskId) {
  return db.prepare('SELECT t.* FROM tags t JOIN task_tags tt ON tt.tag_id = t.id WHERE tt.task_id = ?').all(taskId);
}

module.exports = { insert, remove, listForTask };
