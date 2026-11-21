/**
 * @description Logs the error stack and sends its status and message with fallback values (errorHandler).
 * @param {{stack?: string, status?: number, message?: string}} err - Forwarded error with optional HTTP status and message.
 * @param {import('express').Request} req - Incoming HTTP request.
 * @param {import('express').Response} res - HTTP response to populate.
 * @param {import('express').NextFunction} next - Callback for continuing dispatch or forwarding an error.
 * @returns {void} No return value.
 */
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
}

module.exports = { errorHandler };
