const express = require('express');
const service = require('../services/webhooks');

/**
 * @description Dispatches task-update webhook requests (webhooksRouter).
 * @param {import('express').Request} req - Incoming HTTP request.
 * @param {import('express').Response} res - HTTP response to populate.
 * @param {import('express').NextFunction} next - Callback for continuing dispatch or forwarding an error.
 * @returns {void} Dispatches the request through the router without returning a value.
 */
const webhooksRouter = express.Router();

webhooksRouter.post('/task-update', async (req, res, next) => {
  try {
    const result = await service.receiveTaskUpdate(req.body);
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

module.exports = { webhooksRouter };
