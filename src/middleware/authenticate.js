// TODO: replace with real JWT validation

/**
 * @description Continues requests with the configured API key and sends 401 for other keys (authenticate).
 * @param {import('express').Request} req - Incoming HTTP request.
 * @param {import('express').Response} res - HTTP response to populate.
 * @param {import('express').NextFunction} next - Callback for continuing dispatch or forwarding an error.
 * @returns {void} Continues dispatch or sends an unauthorized response without returning a value.
 */
function authenticate(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === (process.env.API_KEY || 'dev-key')) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { authenticate };
