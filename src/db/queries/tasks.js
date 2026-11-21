const { db } = require('../connection');

/**
 * @description Lists tasks matching optional filters in descending creation order (findTasks).
 * @param {Object} [options={}] - Optional task filters and pagination.
 * @param {string} [options.status] - Status to match when truthy.
 * @param {number} [options.projectId] - Project identifier to match when truthy.
 * @param {number} [options.assigneeId] - Assignee identifier to match when truthy.
 * @param {number} [options.limit=20] - Maximum rows to fetch.
 * @param {number} [options.offset=0] - Rows to skip.
 * @returns {Array<{id: number, title: string, description: string|null, status: string|null, project_id: number|null, assignee_id: number|null, due_date: string|null, created_at: string|null, completed_at: string|null}>} Matching task rows.
 */
function findTasks({ status, projectId, assigneeId, limit = 20, offset = 0 } = {}) {
  let query = 'SELECT * FROM tasks';
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (projectId) {
    conditions.push('project_id = ?');
    params.push(projectId);
  }
  if (assigneeId) {
    conditions.push('assignee_id = ?');
    params.push(assigneeId);
  }
  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  return db.prepare(query).all(params);
}

/**
 * @description Inserts a task row (insert).
 * @param {string} title - Task title to persist.
 * @param {string|null} description - Description text or null.
 * @param {number|null} projectId - Project identifier or null.
 * @param {number|null} assigneeId - Assigned user identifier or null.
 * @param {string|null} dueDate - Due date or null.
 * @returns {{changes: number, lastInsertRowid: number|bigint}} SQLite change count and last inserted row identifier; updates and deletes do not create a new identifier.
 */
function insert(title, description, projectId, assigneeId, dueDate) {
  return db.prepare(
    'INSERT INTO tasks (title, description, project_id, assignee_id, due_date) VALUES (?, ?, ?, ?, ?)'
  ).run(title, description, projectId, assigneeId, dueDate);
}

/**
 * @description Finds a task by identifier (findById).
 * @param {number|bigint} id - SQLite row identifier.
 * @returns {{id: number, title: string, description: string|null, status: string|null, project_id: number|null, assignee_id: number|null, due_date: string|null, created_at: string|null, completed_at: string|null}|undefined} Matching row, or undefined when absent.
 */
function findById(id) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

/**
 * @description Updates a task row (update).
 * @param {string} title - Task title to persist.
 * @param {string|null} description - Description text or null.
 * @param {string|null} status - Task status to persist.
 * @param {number|null} projectId - Project identifier or null.
 * @param {number|null} assigneeId - Assigned user identifier or null.
 * @param {string|null} dueDate - Due date or null.
 * @param {string|null} completedAt - Completion timestamp or null.
 * @param {number|bigint} id - SQLite row identifier.
 * @returns {{changes: number, lastInsertRowid: number|bigint}} SQLite change count and last inserted row identifier; updates and deletes do not create a new identifier.
 */
function update(title, description, status, projectId, assigneeId, dueDate, completedAt, id) {
  return db.prepare(
    'UPDATE tasks SET title=?, description=?, status=?, project_id=?, assignee_id=?, due_date=?, completed_at=? WHERE id=?'
  ).run(title, description, status, projectId, assigneeId, dueDate, completedAt, id);
}

/**
 * @description Deletes a task row (remove).
 * @param {number|bigint} id - SQLite row identifier.
 * @returns {{changes: number, lastInsertRowid: number|bigint}} SQLite change count and last inserted row identifier; updates and deletes do not create a new identifier.
 */
function remove(id) {
  return db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
}

/**
 * @description Counts project tasks grouped by status (countByProjectStatus).
 * @param {number|null} projectId - Project identifier or null.
 * @returns {Array<{status: string|null, count: number}>} Counts for statuses present in the project.
 */
function countByProjectStatus(projectId) {
  return db.prepare(
    'SELECT status, COUNT(*) as count FROM tasks WHERE project_id = ? GROUP BY status'
  ).all(projectId);
}

module.exports = { findTasks, insert, findById, update, remove, countByProjectStatus };
