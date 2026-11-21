const tasks = require('../db/queries/tasks');
const users = require('../db/queries/users');
const queries = require('../db/queries/comments');
const { isNonEmptyString } = require('../utils/validation');

/**
 * @description Checks task existence and lists its comments with author names (listComments).
 * @param {string|number} idInput - Identifier parsed as an integer.
 * @returns {Promise<Array<{id: number, task_id: number|null, user_id: number|null, body: string, created_at: string|null, user_name: string}>>} Author-enriched comment rows in listing order.
 */
async function listComments(idInput) {
  const taskId = parseInt(idInput);
  const task = tasks.findById(taskId);
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 });

  const comments = queries.listForTask(taskId);
  return comments;
}

/**
 * @description Validates the task, comment body, and author before persisting a comment (createComment).
 * @param {string|number} idInput - Identifier parsed as an integer.
 * @param {Object} data - Resource fields supplied by the caller.
 * @param {string|number} data.user_id - Comment author identifier.
 * @param {string} data.body - Comment text.
 * @returns {Promise<{id: number, task_id: number|null, user_id: number|null, body: string, created_at: string|null, user_name: string}|undefined>} The row read after writing, or undefined if no matching row is returned.
 */
async function createComment(idInput, data) {
  const taskId = parseInt(idInput);
  const { user_id, body } = data;

  const task = tasks.findById(taskId);
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 });

  if (!body || !isNonEmptyString(body)) {
    throw Object.assign(new Error('body is required'), { status: 400 });
  }
  if (!user_id) {
    throw Object.assign(new Error('user_id is required'), { status: 400 });
  }
  const user = users.findById(parseInt(user_id));
  if (!user) throw Object.assign(new Error('user not found'), { status: 400 });

  const result = queries.insert(taskId, parseInt(user_id), body);
  const comment = queries.findById(result.lastInsertRowid);
  return comment;
}

module.exports = { listComments, createComment };
