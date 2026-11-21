const tasks = require('../db/queries/tasks');
const users = require('../db/queries/users');
const queries = require('../db/queries/comments');
const { isNonEmptyString } = require('../utils/validation');

async function listComments(idInput) {
  const taskId = parseInt(idInput);
  const task = tasks.findById(taskId);
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 });

  const comments = queries.listForTask(taskId);
  return comments;
}

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
