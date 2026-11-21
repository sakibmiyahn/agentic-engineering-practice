const queries = require('../db/queries/tags');
const { isNonEmptyString } = require('../utils/validation');

/**
 * @description Lists tags in ascending name order (listTags).
 * @returns {Promise<Array<{id: number, name: string}>>} tag rows in listing order.
 */
async function listTags() {
  const tags = queries.list();
  return tags;
}

/**
 * @description Validates and normalizes a tag name before inserting it and mapping uniqueness errors (createTag).
 * @param {Object} data - Resource fields supplied by the caller.
 * @param {string} data.name - Tag name, normalized to lowercase and trimmed.
 * @returns {Promise<{id: number, name: string}|undefined>} The row read after writing, or undefined if no matching row is returned.
 */
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
