const express = require('express');
const service = require('../services/task-tags');

/**
 * @description Dispatches nested task-tag creation and removal requests with inherited task parameters (taskTagsRouter).
 * @param {import('express').Request} req - Incoming HTTP request.
 * @param {import('express').Response} res - HTTP response to populate.
 * @param {import('express').NextFunction} next - Callback for continuing dispatch or forwarding an error.
 * @returns {void} Dispatches the request through the router without returning a value.
 */
const taskTagsRouter = express.Router({ mergeParams: true });

taskTagsRouter.post('/', async (req, res, next) => {
  try {
    const result = await service.applyTag(req.params.taskId, req.body);
    res.status(201).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

taskTagsRouter.delete('/:tagId', async (req, res, next) => {
  try {
    const result = await service.removeTag(req.params.taskId, req.params.tagId);
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

module.exports = { taskTagsRouter };
