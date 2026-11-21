const queries = require('../db/queries/projects');
const { isNonEmptyString } = require('../utils/validation');
const taskQueries = require('../db/queries/tasks');

function getProjectStats(projectId) {
  const rows = taskQueries.countByProjectStatus(projectId);
  const stats = { total: 0, active: 0, completed: 0, archived: 0 };
  for (const row of rows) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }
  return stats;
}

/**
 * @description Lists projects in descending creation order (listProjects).
 * @returns {Promise<Array<{id: number, name: string, description: string|null, owner_id: number|null, created_at: string|null}>>} project rows in listing order.
 */
async function listProjects() {
  const projects = queries.list();
  return projects;
}

/**
 * @description Validates the project name and persists a project (createProject).
 * @param {Object} data - Resource fields supplied by the caller.
 * @param {string} data.name - Project name.
 * @param {string|null} [data.description] - Project description.
 * @param {number|string|null} [data.owner_id] - Owner identifier.
 * @returns {Promise<{id: number, name: string, description: string|null, owner_id: number|null, created_at: string|null}|undefined>} The row read after writing, or undefined if no matching row is returned.
 */
async function createProject(data) {
  const { name, description, owner_id } = data;
  if (!name || !isNonEmptyString(name)) {
    throw Object.assign(new Error('name is required'), { status: 400 });
  }
  const result = queries.insert(name, description || null, owner_id || null);
  const project = queries.findById(result.lastInsertRowid);
  return project;
}

/**
 * @description Gets a project with total and per-status task counts (getProject).
 * @param {string|number} idInput - Identifier parsed as an integer.
 * @returns {Promise<{id: number, name: string, description: string|null, owner_id: number|null, created_at: string|null, stats: {total: number, active: number, completed: number, archived: number}}>} Existing project enriched with task status totals.
 */
async function getProject(idInput) {
  const id = parseInt(idInput);
  const project = queries.findById(id);
  if (!project) throw Object.assign(new Error('Project not found'), { status: 404 });

  const stats = getProjectStats(id);
  return { ...project, stats };
}

/**
 * @description Updates supplied project fields while preserving omitted values (updateProject).
 * @param {string|number} idInput - Identifier parsed as an integer.
 * @param {Object} data - Resource fields supplied by the caller.
 * @param {string} [data.name] - Project name.
 * @param {string|null} [data.description] - Project description.
 * @param {number|string|null} [data.owner_id] - Owner identifier.
 * @returns {Promise<{id: number, name: string, description: string|null, owner_id: number|null, created_at: string|null}|undefined>} The row read after writing, or undefined if no matching row is returned.
 */
async function updateProject(idInput, data) {
  const id = parseInt(idInput);
  const existing = queries.findById(id);
  if (!existing) throw Object.assign(new Error('Project not found'), { status: 404 });

  const name = data.name !== undefined ? data.name : existing.name;
  const description = data.description !== undefined ? data.description : existing.description;
  const owner_id = data.owner_id !== undefined ? data.owner_id : existing.owner_id;

  queries.update(name, description, owner_id, id);
  const updated = queries.findById(id);
  return updated;
}

/**
 * @description Deletes a project or throws when no row was removed (deleteProject).
 * @param {string|number} idInput - Identifier parsed as an integer.
 * @returns {Promise<{deleted: boolean}>} Acknowledgement that the requested row was deleted.
 */
async function deleteProject(idInput) {
  const id = parseInt(idInput);
  const result = queries.remove(id);
  if (result.changes === 0) throw Object.assign(new Error('Project not found'), { status: 404 });
  return { deleted: true };
}

module.exports = { listProjects, createProject, getProject, updateProject, deleteProject };
