/**
 * @description Checks whether an email address matches the basic email format (validateEmail).
 * @param {string} email - Email address to validate.
 * @returns {boolean} Whether the address matches the email format.
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * @description Checks whether a value is a string containing non-whitespace characters (isNonEmptyString).
 * @param {*} val - Value to inspect.
 * @returns {boolean} Whether the value is a non-empty string after trimming.
 */
function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

module.exports = { validateEmail, isNonEmptyString };
