const express = require('express');
const service = require('../services/system');

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
