/**
 * Checks whether an email address matches the basic email format.
 * @param {string} email - The email address to validate.
 * @returns {boolean} Whether the address matches the email format.
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Checks whether a value is a string containing non-whitespace characters.
 * @param {*} val - The value to check.
 * @returns {boolean} Whether the value is a non-empty string after trimming.
 */
function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

module.exports = { validateEmail, isNonEmptyString };
