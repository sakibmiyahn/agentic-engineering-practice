const express = require('express');
const service = require('../services/tags');

/**
 * @description Dispatches tag listing and creation requests (tagsRouter).
 * @param {import('express').Request} req - Incoming HTTP request.
 * @param {import('express').Response} res - HTTP response to populate.
 * @param {import('express').NextFunction} next - Callback for continuing dispatch or forwarding an error.
 * @returns {void} Dispatches the request through the router without returning a value.
 */
const tagsRouter = express.Router();

tagsRouter.get('/', async (req, res, next) => {
  try {
    const result = await service.listTags();
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

tagsRouter.post('/', async (req, res, next) => {
  try {
    const result = await service.createTag(req.body);
    res.status(201).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

module.exports = { tagsRouter };
