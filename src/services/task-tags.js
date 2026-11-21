const tasks = require('../db/queries/tasks');
const tags = require('../db/queries/tags');
const queries = require('../db/queries/task-tags');

async function applyTag(idInput, data) {
  const taskId = parseInt(idInput);
  const { tag_id } = data;

  const task = tasks.findById(taskId);
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404 });

  if (!tag_id) throw Object.assign(new Error('tag_id is required'), { status: 400 });
  const tag = tags.findById(parseInt(tag_id));
  if (!tag) throw Object.assign(new Error('Tag not found'), { status: 404 });

  try {
    queries.insert(taskId, parseInt(tag_id));
    return { task_id: taskId, tag_id: parseInt(tag_id) };
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      throw Object.assign(new Error('tag already applied to this task'), { status: 409 });
    }
    throw Object.assign(new Error(err.message), { status: 500 });
  }
}

async function removeTag(idInput, tagIdInput) {
  const taskId = parseInt(idInput);
  const tagId = parseInt(tagIdInput);
  const result = queries.remove(taskId, tagId);
  if (result.changes === 0) throw Object.assign(new Error('Tag not applied to this task'), { status: 404 });
  return { deleted: true };
}

module.exports = { applyTag, removeTag };
