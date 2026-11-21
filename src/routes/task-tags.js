const express = require('express');
const service = require('../services/task-tags');

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
