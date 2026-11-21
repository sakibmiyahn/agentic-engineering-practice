const queries = require('../db/queries/tags');
const { isNonEmptyString } = require('../utils/validation');

async function listTags() {
  const tags = queries.list();
  return tags;
}

async function createTag(data) {
  const { name } = data;
  if (!name || !isNonEmptyString(name)) {
    throw Object.assign(new Error('name is required'), { status: 400 });
  }
  try {
    const result = queries.insert(name.toLowerCase().trim());
    const tag = queries.findById(result.lastInsertRowid);
    return tag;
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      throw Object.assign(new Error('tag already exists'), { status: 409 });
    }
    throw Object.assign(new Error(err.message), { status: 500 });
  }
}

module.exports = { listTags, createTag };
