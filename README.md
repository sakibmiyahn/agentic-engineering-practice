# Taskr API

Task management REST API built with CommonJS, Express, SQLite (`better-sqlite3`), Jest, and Supertest.

## Setup

Use a Node.js version supported by `better-sqlite3` (Node 20 or newer).

```bash
npm install --package-lock=false
npm run db:seed
npm start
```

Visit `http://localhost:3000/health`. `npm run dev` starts the same entry point with Node's file watcher.

## Structure

```text
src/
  index.js                 Express composition and server startup
  config.js                PORT configuration
  routes/                  Named resource routers; HTTP input/output and error forwarding
  services/                Resource behavior, validation, composition, notifications
  db/
    connection.js          SQLite connection and pragmas
    schema.js              Shared createSchema(db) used by seeding and tests
    seed.js                Sample data initialization
    queries/               SQL for users, projects, tasks, comments, tags, task-tags
  middleware/              authenticate, request-logger, error-handler
  utils/validation.js      Shared string and email validators
tests/
  helpers/database.js      In-memory database lifecycle and fixtures
  *.test.js                Eight endpoint regression suites
```

Dependencies flow from the entry point through routers, services, queries, and connection. Services may compose multiple resource queries. Query modules do not import services or routers. All routers are registered in `src/index.js`; comments and task tags use `mergeParams: true` for their parent task identifier.

## API

The API has 24 endpoints. Responses and validation retain the existing contract.

| Router | Endpoints |
|---|---|
| System | `GET /`, `GET /health` |
| Webhooks | `POST /webhooks/task-update` |
| Users | `GET /users`, `POST /users`, `GET /users/:id`, `PUT /users/:id`, `DELETE /users/:id` |
| Projects | `GET /projects`, `POST /projects`, `GET /projects/:id`, `PUT /projects/:id`, `DELETE /projects/:id` |
| Tasks | `GET /tasks`, `POST /tasks`, `GET /tasks/:id`, `PUT /tasks/:id`, `DELETE /tasks/:id` |
| Comments | `GET /tasks/:taskId/comments`, `POST /tasks/:taskId/comments` |
| Tags | `GET /tags`, `POST /tags` |
| Task tags | `POST /tasks/:taskId/tags`, `DELETE /tasks/:taskId/tags/:tagId` |

Only user and project deletion require `x-api-key`, checked against `API_KEY` or the default `dev-key`. The webhook acknowledges valid JSON and logs its payload. The notification service logs welcome emails; it has no external provider. User creation persists before awaiting delivery, so an email failure leaves the user stored.

Task listing supports `status`, `project_id`, `assignee_id`, `page`, and `page_size`. Pagination defaults to 20 and caps positive page sizes at 100. Existing `parseInt` coercion and negative pagination behavior are retained. Task statuses are local to the task service: `active`, `completed`, and `archived`. Updates intentionally retain permissive field validation and SQLite constraint errors. Task detail includes tags and comments; task lists and write responses do not.

## Configuration and database

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Listening port |
| `DB_PATH` | `taskr.db` | SQLite path, relative to the working directory unless absolute |
| `NODE_ENV` | unset | `test` selects `:memory:` regardless of `DB_PATH` |
| `API_KEY` | `dev-key` | User/project deletion authentication |

Seeding creates the shared schema and sample data: 5 users, 3 projects, 20 tasks, 15 comments, 8 tags, and 16 task-tag associations. Running it again skips sample insertion if any users exist. Startup does not seed the database automatically. Foreign keys and WAL mode are enabled; dependent records prevent deletion rather than cascading.

```bash
npm run db:seed
DB_PATH=/tmp/taskr-example.db npm run db:seed
npm run db:reset
```

`db:reset` deletes the default `taskr.db` and runs the seed; it discards local data. For a custom `DB_PATH`, remove that database explicitly before seeding.

## Testing

```bash
npm test
npm run test:watch
```

The default Jest command discovers only `tests/*.test.js`. Eight suites cover all endpoints using isolated in-memory SQLite, the production schema, and reset fixtures. No seeded database or separately running server is required. Supertest binds local sockets, so restricted environments must permit loopback listening.

Regression checks include validation precedence, messages and status codes, identifier coercion, persistence, authentication, nested resources, task completion timestamps, and email-delivery failure. Successful list/system endpoints do not have two distinct domain error cases; tests retain their existing contracts instead of adding validation merely for coverage.

No build, lint, or formatting command is configured.
