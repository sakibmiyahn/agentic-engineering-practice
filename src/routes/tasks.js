const express = require('express');
const service = require('../services/tasks');

/**
 * @description Dispatches task CRUD and filtered listing requests (tasksRouter).
 * @param {import('express').Request} req - Incoming HTTP request.
 * @param {import('express').Response} res - HTTP response to populate.
 * @param {import('express').NextFunction} next - Callback for continuing dispatch or forwarding an error.
 * @returns {void} Dispatches the request through the router without returning a value.
 */
const tasksRouter = express.Router();

tasksRouter.get('/', async (req, res, next) => {
  try {
    const result = await service.listTasks(req.query);
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

tasksRouter.post('/', async (req, res, next) => {
  try {
    const result = await service.createTask(req.body);
    res.status(201).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

tasksRouter.get('/:id', async (req, res, next) => {
  try {
    const result = await service.getTask(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

tasksRouter.put('/:id', async (req, res, next) => {
  try {
    const result = await service.updateTask(req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

tasksRouter.delete('/:id', async (req, res, next) => {
  try {
    const result = await service.deleteTask(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

module.exports = { tasksRouter };
