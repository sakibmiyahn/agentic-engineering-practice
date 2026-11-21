const express = require('express');
const service = require('../services/system');

/**
 * @description Dispatches API information and health requests (systemRouter).
 * @param {import('express').Request} req - Incoming HTTP request.
 * @param {import('express').Response} res - HTTP response to populate.
 * @param {import('express').NextFunction} next - Callback for continuing dispatch or forwarding an error.
 * @returns {void} Dispatches the request through the router without returning a value.
 */
const systemRouter = express.Router();

systemRouter.get('/', async (req, res, next) => {
  try {
    const result = await service.getInfo();
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

systemRouter.get('/health', async (req, res, next) => {
  try {
    const result = await service.getHealth();
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

module.exports = { systemRouter };
