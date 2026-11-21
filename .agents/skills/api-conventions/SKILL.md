---
name: api-conventions
description: Follow Taskr API conventions when adding or changing an endpoint, including resource routers, service delegation, error forwarding, and route registration.
---

# Adding a Taskr API Endpoint

These conventions describe the current src/ architecture. Inspect the relevant router, service, query module, and tests before changing behavior. Keep changes scoped.

## Resource Route Files

- Put routes in the corresponding resource module under `src/routes/`. Do not recreate root-level route modules.
- Match the filename to the resource name in lowercase plural, such as `tasks.js`, `users.js`, or `projects.js`.
- Each route file must export a named Express Router, such as `tasksRouter`. With the repository's CommonJS conventions, use `module.exports = { tasksRouter }`.
- Define paths relative to the resource's mount point: use `/:id` inside `tasks.js`, not `/tasks/:id`.

## Service Delegation and Errors

Every route handler must call a corresponding function in `src/services/`. Keep validation and business logic in services and SQL in the corresponding `src/db/queries/` module; handlers should extract request inputs, delegate, send the response, and forward errors.

Pass errors to Express's `next` function as an object containing a numeric HTTP `status` and a `message`. Preserve service-provided status codes and messages, and use status 500 for unexpected errors. For example:

```javascript
// src/routes/tasks.js
const express = require('express');
const { getTask } = require('../services/tasks');

const tasksRouter = express.Router();

tasksRouter.get('/:id', async (req, res, next) => {
  try {
    const task = await getTask(req.params.id);
    res.json(task);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

module.exports = { tasksRouter };
```

The service should preserve identifier coercion and throw an error with `status: 404` and an appropriate message when the task does not exist. Follow the same delegation pattern for create, update, delete, and list endpoints.

## Registration and Verification

Register all resource routers in `src/index.js` with `app.use`, using the resource path and imported named router:

```javascript
const { tasksRouter } = require('./routes/tasks');

app.use('/tasks', tasksRouter);
```

Register routers before the central error-handling middleware. For comments and task tags, use `express.Router({ mergeParams: true })`, read `req.params.taskId`, and mount directly in `src/index.js` at `/tasks/:taskId/comments` or `/tasks/:taskId/tags`. Do not register nested routers inside tasks.js.

Keep dependencies flowing routers → services → queries → connection. Never import routers from services or queries. Put SQL only in the six resource query modules (schema and seed SQL remain in src/db). Use named resource query functions and compose them in services. Keep task statuses local to the task service and PORT in src/config.js. Preserve validation order, parseInt coercion, messages, statuses, authentication scope, timestamps, and persistence before email delivery.

Add endpoint tests using `tests/resource.test.js` naming. Verify successful responses, validation failures, missing resources, and forwarded errors as applicable. Run `npm test` and report the actual result.
