---
name: testing-standards
description: Write or update Taskr API endpoint tests using Jest, Supertest, isolated in-memory SQLite, and consistent resource-based naming and behavioral coverage.
---

# Taskr API Testing Standards

## File Naming

Place endpoint test files in `tests/` and name them `resource.test.js`, with the resource name in lowercase, for example `tasks.test.js`, `users.test.js`, or `projects.test.js`. Existing inconsistent names are a known problem scheduled for standardization; do not copy them or rename unrelated files as part of writing tests.

## Test Environment and Isolation

Use Jest and Supertest against the Express app and an in-memory SQLite database. Set `process.env.NODE_ENV = 'test'` before importing the app or database so `DB.js` selects `:memory:`. Use the same database connection as the app.

Initialize the schema programmatically with the existing `tests/schema.js` helper. Reset fixtures before each test, deleting dependent rows before parent rows to respect foreign keys. Create all data required by each test within its own setup; tests must not depend on execution order, a pre-seeded database, or data from another test.

Use `request(app)` rather than starting a separate server. Follow the current import paths, updating them to the actual entry point and database module if the refactor has moved those files. Keep external integrations deterministic with Jest mocks where needed; tests must not require live services, credentials, or network access to external systems.

## Endpoint Coverage

For each endpoint covered in a resource test file, include the happy path and at least two distinct error cases. Choose errors from the endpoint's actual contract, such as missing required input, invalid input, an unknown resource, a duplicate value, or unauthorized access. Assert HTTP status codes and relevant response fields; verify observable persistence changes when applicable.

Do not invent unsupported behavior merely to meet the error-case count. If the endpoint does not yet expose two meaningful errors, identify that gap and report it rather than silently changing production behavior or claiming complete coverage.

## Test Descriptions

Group tests by HTTP method and path, such as `describe('POST /tasks', ...)`. Write test descriptions in plain English describing observable endpoint behavior:

- `creates a task with a valid title`
- `rejects a task without a title`
- `returns not found when the task does not exist`

Avoid descriptions about internal SQL, helper calls, or implementation details.

## Running and Verification

After normal dependency installation (`npm install`), the complete suite must run with `npm test` alone. No database seeding, manual schema creation, environment configuration, separate server, or external setup should be required. Keep schema initialization, fixtures, and mocks inside the test setup.

Run `npm test` after changing tests and report the actual result. Distinguish failures introduced by the change from pre-existing failures. Do not weaken assertions or modify expected behavior merely to make an incorrect implementation pass.
