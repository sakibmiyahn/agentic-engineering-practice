const express = require('express');
const service = require('../services/projects');
const { authenticate } = require('../middleware/authenticate');

const projectsRouter = express.Router();

projectsRouter.get('/', async (req, res, next) => {
  try {
    const result = await service.listProjects();
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

projectsRouter.post('/', async (req, res, next) => {
  try {
    const result = await service.createProject(req.body);
    res.status(201).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

projectsRouter.get('/:id', async (req, res, next) => {
  try {
    const result = await service.getProject(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

projectsRouter.put('/:id', async (req, res, next) => {
  try {
    const result = await service.updateProject(req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

projectsRouter.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await service.deleteProject(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

module.exports = { projectsRouter };
