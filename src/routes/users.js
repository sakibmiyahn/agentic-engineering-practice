const express = require('express');
const service = require('../services/users');
const { authenticate } = require('../middleware/authenticate');

/**
 * @description Dispatches user CRUD requests with API-key protection for deletion (usersRouter).
 * @param {import('express').Request} req - Incoming HTTP request.
 * @param {import('express').Response} res - HTTP response to populate.
 * @param {import('express').NextFunction} next - Callback for continuing dispatch or forwarding an error.
 * @returns {void} Dispatches the request through the router without returning a value.
 */
const usersRouter = express.Router();

usersRouter.get('/', async (req, res, next) => {
  try {
    const result = await service.listUsers();
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

usersRouter.post('/', async (req, res, next) => {
  try {
    const result = await service.createUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

usersRouter.get('/:id', async (req, res, next) => {
  try {
    const result = await service.getUser(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

usersRouter.put('/:id', async (req, res, next) => {
  try {
    const result = await service.updateUser(req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

usersRouter.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await service.deleteUser(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

module.exports = { usersRouter };
