const express = require('express');
const service = require('../services/comments');

/**
 * @description Dispatches nested task-comment requests with inherited task parameters (commentsRouter).
 * @param {import('express').Request} req - Incoming HTTP request.
 * @param {import('express').Response} res - HTTP response to populate.
 * @param {import('express').NextFunction} next - Callback for continuing dispatch or forwarding an error.
 * @returns {void} Dispatches the request through the router without returning a value.
 */
const commentsRouter = express.Router({ mergeParams: true });

commentsRouter.get('/', async (req, res, next) => {
  try {
    const result = await service.listComments(req.params.taskId);
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

commentsRouter.post('/', async (req, res, next) => {
  try {
    const result = await service.createComment(req.params.taskId, req.body);
    res.status(201).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

module.exports = { commentsRouter };
