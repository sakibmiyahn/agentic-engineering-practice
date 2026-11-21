const queries = require('../db/queries/users');
const { isNonEmptyString, validateEmail } = require('../utils/validation');
const { sendWelcomeEmail } = require('./notifications');

/**
 * @description Lists users in descending creation order (listUsers).
 * @returns {Array<{id: number, name: string, email: string, created_at: string|null}>} user rows in listing order.
 */
function listUsers() {
  return queries.list();
}

/**
 * @description Validates and persists a user before awaiting welcome-email delivery (createUser).
 * @param {Object} data - Resource fields supplied by the caller.
 * @param {string} data.name - User name.
 * @param {string} data.email - User email address.
 * @returns {Promise<{id: number, name: string, email: string, created_at: string|null}>} Persisted user after delivery succeeds; delivery failure leaves the account persisted.
 */
async function createUser(data) {
  const { name, email } = data;
  if (!name || !isNonEmptyString(name)) {
    throw Object.assign(new Error('name is required'), { status: 400 });
  }
  if (!email || !isNonEmptyString(email)) {
    throw Object.assign(new Error('email is required'), { status: 400 });
  }
  try {
    if (!validateEmail(email)) {
      throw Object.assign(new Error('Invalid email address'), { status: 400 });
    }
    const result = queries.insert(name, email);
    const user = queries.findById(result.lastInsertRowid);
    // Preserve the account if welcome-email delivery fails.
    await sendWelcomeEmail(user);
    return user;
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      throw Object.assign(new Error('email already exists'), { status: 409 });
    }
    throw err;
  }
}

/**
 * @description Gets a user by parsed identifier or throws when the user is absent (getUser).
 * @param {string|number} idInput - Identifier parsed as an integer.
 * @returns {{id: number, name: string, email: string, created_at: string|null}} The existing resource.
 */
function getUser(idInput) {
  const user = queries.findById(parseInt(idInput));
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  return user;
}

/**
 * @description Updates supplied user fields after checking that the user exists (updateUser).
 * @param {string|number} idInput - Identifier parsed as an integer.
 * @param {Object} data - Resource fields supplied by the caller.
 * @param {string} [data.name] - User name.
 * @param {string} [data.email] - User email address.
 * @returns {{id: number, name: string, email: string, created_at: string|null}|undefined} The row read after writing, or undefined if no matching row is returned.
 */
function updateUser(idInput, data) {
  const id = parseInt(idInput);
  const existing = queries.findById(id);
  if (!existing) throw Object.assign(new Error('User not found'), { status: 404 });
  const name = data.name !== undefined ? data.name : existing.name;
  const email = data.email !== undefined ? data.email : existing.email;
  queries.update(name, email, id);
  return queries.findById(id);
}

/**
 * @description Deletes a user or throws when no row was removed (deleteUser).
 * @param {string|number} idInput - Identifier parsed as an integer.
 * @returns {{deleted: boolean}} Acknowledgement that the requested row was deleted.
 */
function deleteUser(idInput) {
  const result = queries.remove(parseInt(idInput));
  if (result.changes === 0) throw Object.assign(new Error('User not found'), { status: 404 });
  return { deleted: true };
}

module.exports = { listUsers, createUser, getUser, updateUser, deleteUser };
