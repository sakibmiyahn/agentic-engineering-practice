const express = require('express');
const service = require('../services/tags');

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
