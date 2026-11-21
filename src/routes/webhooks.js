const express = require('express');
const service = require('../services/webhooks');

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
