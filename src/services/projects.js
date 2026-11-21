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

async function listProjects() {
  const projects = queries.list();
  return projects;
}

async function createProject(data) {
  const { name, description, owner_id } = data;
  if (!name || !isNonEmptyString(name)) {
    throw Object.assign(new Error('name is required'), { status: 400 });
  }
  const result = queries.insert(name, description || null, owner_id || null);
  const project = queries.findById(result.lastInsertRowid);
  return project;
}

async function getProject(idInput) {
  const id = parseInt(idInput);
  const project = queries.findById(id);
  if (!project) throw Object.assign(new Error('Project not found'), { status: 404 });

  const stats = getProjectStats(id);
  return { ...project, stats };
}

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

async function deleteProject(idInput) {
  const id = parseInt(idInput);
  const result = queries.remove(id);
  if (result.changes === 0) throw Object.assign(new Error('Project not found'), { status: 404 });
  return { deleted: true };
}

module.exports = { listProjects, createProject, getProject, updateProject, deleteProject };
