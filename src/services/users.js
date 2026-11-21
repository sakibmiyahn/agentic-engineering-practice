const queries = require('../db/queries/users');
const { isNonEmptyString, validateEmail } = require('../utils/validation');
const { sendWelcomeEmail } = require('./notifications');

function listUsers() {
  return queries.list();
}

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

function getUser(idInput) {
  const user = queries.findById(parseInt(idInput));
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  return user;
}

function updateUser(idInput, data) {
  const id = parseInt(idInput);
  const existing = queries.findById(id);
  if (!existing) throw Object.assign(new Error('User not found'), { status: 404 });
  const name = data.name !== undefined ? data.name : existing.name;
  const email = data.email !== undefined ? data.email : existing.email;
  queries.update(name, email, id);
  return queries.findById(id);
}

function deleteUser(idInput) {
  const result = queries.remove(parseInt(idInput));
  if (result.changes === 0) throw Object.assign(new Error('User not found'), { status: 404 });
  return { deleted: true };
}

module.exports = { listUsers, createUser, getUser, updateUser, deleteUser };
