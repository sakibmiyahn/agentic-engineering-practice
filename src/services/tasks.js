const projects = require('../db/queries/projects');
const users = require('../db/queries/users');
const queries = require('../db/queries/tasks');
const { isNonEmptyString } = require('../utils/validation');
const comments = require('../db/queries/comments');
const taskTags = require('../db/queries/task-tags');
const VALID_TASK_STATUSES = ['active', 'completed', 'archived'];

function getTaskById(id) {
  const task = queries.findById(id);
  if (!task) return null;
  task.tags = taskTags.listForTask(id);
  task.comments = comments.listForTask(id);
  return task;
}

/**
 * @description Validates the status filter and lists tasks with parsed, capped pagination (listTasks).
 * @param {Object} filters - Task listing filters and pagination.
 * @param {string} [filters.status] - Status to validate and match.
 * @param {string|number} [filters.project_id] - Project identifier to parse.
 * @param {string|number} [filters.assignee_id] - Assignee identifier to parse.
 * @param {string|number} [filters.page] - One-based page, defaulting to 1 when parsing is falsy.
 * @param {string|number} [filters.page_size] - Page size, defaulting to 20 when parsing is falsy and capped at 100.
 * @returns {Promise<Array<{id: number, title: string, description: string|null, status: string|null, project_id: number|null, assignee_id: number|null, due_date: string|null, created_at: string|null, completed_at: string|null}>>} task rows in listing order.
 */
async function listTasks(filters) {
  const { status, project_id, assignee_id, page, page_size } = filters;

  if (status && !VALID_TASK_STATUSES.includes(status)) {
    throw Object.assign(new Error(`status must be one of: ${VALID_TASK_STATUSES.join(', ')}`), { status: 400 });
  }

  const limit = Math.min(100, parseInt(page_size) || 20);
  const offset = ((parseInt(page) || 1) - 1) * limit;

  const tasks = queries.findTasks({
    status: status || undefined,
    projectId: project_id ? parseInt(project_id) : undefined,
    assigneeId: assignee_id ? parseInt(assignee_id) : undefined,
    limit,
    offset
  });
  return tasks;
}

/**
 * @description Validates the title and referenced resources before persisting a task (createTask).
 * @param {Object} data - Resource fields supplied by the caller.
 * @param {string} data.title - Task title.
 * @param {string|null} [data.description] - Task description.
 * @param {number|string|null} [data.project_id] - Project identifier.
 * @param {number|string|null} [data.assignee_id] - Assignee identifier.
 * @param {string|null} [data.due_date] - Due date.
 * @returns {Promise<{id: number, title: string, description: string|null, status: string|null, project_id: number|null, assignee_id: number|null, due_date: string|null, created_at: string|null, completed_at: string|null}|undefined>} The row read after writing, or undefined if no matching row is returned.
 */
async function createTask(data) {
  const { title, description, project_id, assignee_id, due_date } = data;
  if (!title || !isNonEmptyString(title)) {
    throw Object.assign(new Error('title is required'), { status: 400 });
  }
  if (project_id) {
    const project = projects.findById(parseInt(project_id));
    if (!project) throw Object.assign(new Error('project not found'), { status: 400 });
  }
  if (assignee_id) {
    const user = users.findById(parseInt(assignee_id));
    if (!user) throw Object.assign(new Error('assignee not found'), { status: 400 });
  }
  const result = queries.insert(
    title,
    description || null,
    project_id ? parseInt(project_id) : null,
    assignee_id ? parseInt(assignee_id) : null,
    due_date || null
  );
  const task = queries.findById(result.lastInsertRowid);
  return task;
}

/**
 * @description Gets a task with its tags and author-enriched comments (getTask).
 * @param {string|number} idInput - Identifier parsed as an integer.
 * @returns {Promise<{id: number, title: string, description: string|null, status: string|null, project_id: number|null, assignee_id: number|null, due_date: string|null, created_at: string|null, completed_at: string|null, tags: Array<{id: number, name: string}>, comments: Array<{id: number, task_id: number|null, user_id: number|null, body: string, created_at: string|null, user_name: string}>}>} Existing task enriched with tags and author-named comments.
 */
async function getTask(idInput) {
  const task = getTaskById(parseInt(idInput));
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 });
  return task;
}

/**
 * @description Updates supplied task fields and adjusts the completion timestamp for status transitions (updateTask).
 * @param {string|number} idInput - Identifier parsed as an integer.
 * @param {Object} data - Resource fields supplied by the caller.
 * @param {string} [data.title] - Task title.
 * @param {string|null} [data.description] - Task description.
 * @param {number|string|null} [data.project_id] - Project identifier.
 * @param {number|string|null} [data.assignee_id] - Assignee identifier.
 * @param {string|null} [data.due_date] - Due date.
 * @param {string|null} [data.status] - Requested status; entering completed sets the completion timestamp.
 * @returns {Promise<{id: number, title: string, description: string|null, status: string|null, project_id: number|null, assignee_id: number|null, due_date: string|null, created_at: string|null, completed_at: string|null}|undefined>} The row read after writing, or undefined if no matching row is returned.
 */
async function updateTask(idInput, data) {
  const id = parseInt(idInput);
  const existing = queries.findById(id);
  if (!existing) throw Object.assign(new Error('Task not found'), { status: 404 });

  const { title, description, status, project_id, assignee_id, due_date } = data;

  if (status && !VALID_TASK_STATUSES.includes(status)) {
    throw Object.assign(new Error(`status must be one of: ${VALID_TASK_STATUSES.join(', ')}`), { status: 400 });
  }

  const updatedTitle = title !== undefined ? title : existing.title;
  const updatedDesc = description !== undefined ? description : existing.description;
  const updatedStatus = status !== undefined ? status : existing.status;
  const updatedProject = project_id !== undefined ? project_id : existing.project_id;
  const updatedAssignee = assignee_id !== undefined ? assignee_id : existing.assignee_id;
  const updatedDue = due_date !== undefined ? due_date : existing.due_date;
  const completedAt = updatedStatus === 'completed' && existing.status !== 'completed'
    ? new Date().toISOString()
    : (updatedStatus !== 'completed' ? null : existing.completed_at);

  queries.update(updatedTitle, updatedDesc, updatedStatus, updatedProject, updatedAssignee, updatedDue, completedAt, id);

  const task = queries.findById(id);
  return task;
}

/**
 * @description Deletes a task or throws when no row was removed (deleteTask).
 * @param {string|number} idInput - Identifier parsed as an integer.
 * @returns {Promise<{deleted: boolean}>} Acknowledgement that the requested row was deleted.
 */
async function deleteTask(idInput) {
  const id = parseInt(idInput);
  const result = queries.remove(id);
  if (result.changes === 0) throw Object.assign(new Error('Task not found'), { status: 404 });
  return { deleted: true };
}

module.exports = { listTasks, createTask, getTask, updateTask, deleteTask };
