---
name: api-conventions
description: Follow Taskr API conventions when adding a new endpoint, including resource routers, service delegation, error forwarding, and route registration.
---

# Adding a Taskr API Endpoint

These conventions define the target structure after the refactor. The current root-level layout has intentional structural problems; do not copy its oversized route handlers or mixed responsibilities. Inspect the current implementation before making changes. Applying this skill does not authorize a broad refactor.

## Resource Route Files

- After the refactor, put new routes in a dedicated file under `src/routes/`. Never add new route logic to the existing root-level `routes.js`.
- Match the filename to the resource name in lowercase plural, such as `tasks.js`, `users.js`, or `projects.js`.
- Each route file must export a named Express Router, such as `tasksRouter`. With the repository's CommonJS conventions, use `module.exports = { tasksRouter }`.
- Define paths relative to the resource's mount point: use `/:id` inside `tasks.js`, not `/tasks/:id`.

## Service Delegation and Errors

Every route handler must call a corresponding function in `src/services/`. Keep business logic and database operations in the service layer; handlers should extract request inputs, delegate, send the response, and forward errors.

Pass errors to Express's `next` function as an object containing a numeric HTTP `status` and a `message`. Preserve service-provided status codes and messages, and use status 500 for unexpected errors. For example:

```javascript
// src/routes/tasks.js
const express = require('express');
const { getTaskById } = require('../services/tasks');

const tasksRouter = express.Router();

tasksRouter.get('/:id', async (req, res, next) => {
  try {
    const task = await getTaskById(req.params.id);
    res.json(task);
  } catch (err) {
    next({ status: err.status || 500, message: err.message || 'Internal server error' });
  }
});

module.exports = { tasksRouter };
```

The service should validate the identifier and throw an error with `status: 404` and an appropriate message when the task does not exist. Follow the same delegation pattern for create, update, delete, and list endpoints.

## Registration and Verification

Register all resource routers in `src/index.js` with `app.use`, using the resource path and imported named router:

```javascript
const { tasksRouter } = require('./routes/tasks');

app.use('/tasks', tasksRouter);
```

Register routers before the central error-handling middleware. If the refactor has not yet established the `src/` entry point and service layer, account for that integration explicitly within the requested scope; do not create disconnected route files or silently perform the entire refactor.

Add endpoint tests using `tests/resource.test.js` naming. Verify successful responses, validation failures, missing resources, and forwarded errors as applicable. Run `npm test` and report the actual result.
