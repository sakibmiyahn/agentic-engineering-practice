const express = require('express');
const { PORT } = require('./config');
const { requestLogger } = require('./middleware/request-logger');
const { errorHandler } = require('./middleware/error-handler');
const { systemRouter } = require('./routes/system');
const { webhooksRouter } = require('./routes/webhooks');
const { usersRouter } = require('./routes/users');
const { projectsRouter } = require('./routes/projects');
const { tasksRouter } = require('./routes/tasks');
const { commentsRouter } = require('./routes/comments');
const { tagsRouter } = require('./routes/tags');
const { taskTagsRouter } = require('./routes/task-tags');

/**
 * @description Dispatches Taskr HTTP requests through JSON parsing, logging, resource routers, and error handling (app).
 * @param {import('express').Request} req - Incoming HTTP request.
 * @param {import('express').Response} res - HTTP response to populate.
 * @param {import('express').NextFunction} next - Callback for continuing dispatch or forwarding an error.
 * @returns {void} Dispatches the request through the application without returning a value.
 */
const app = express();

app.use(express.json());
app.use(requestLogger);

app.use('/', systemRouter);
app.use('/webhooks', webhooksRouter);
app.use('/users', usersRouter);
app.use('/projects', projectsRouter);
app.use('/tasks', tasksRouter);
app.use('/tasks/:taskId/comments', commentsRouter);
app.use('/tags', tagsRouter);
app.use('/tasks/:taskId/tags', taskTagsRouter);

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Taskr API running on port ${PORT}`);
  });
}

module.exports = app;
