# Repository Guidelines

## Project Structure & Module Organization
Taskr is a CommonJS Node.js REST API using Express and SQLite through `better-sqlite3`. `src/index.js` composes the application, mounts all eight named routers, and starts the server only when invoked directly. `src/config.js` contains PORT configuration.

Resource routers live in `src/routes/`: system, webhooks, users, projects, tasks, comments, tags, and task-tags. Matching modules in `src/services/` own validation and business behavior; notifications owns welcome-email composition and delivery. Six resource query modules in `src/db/queries/` own runtime SQL. `src/db/connection.js` owns the database connection and pragmas, `schema.js` exports the shared schema initializer, and `seed.js` seeds sample data. Middleware modules live in `src/middleware/`; shared validators belong in `src/utils/validation.js`. Task statuses stay local to the task service.

Keep the dependency direction entry point → routers → services → queries → connection. Services may compose resource queries; never import routes or services from query modules. Do not introduce cycles. Comments and task-tags routers use `mergeParams: true` and are mounted under `/tasks/:taskId` directly in the entry point. Tests use eight resource suites and `tests/helpers/database.js`. There is no frontend or assets directory.

## Available Skills

- Use [api-conventions](.agents/skills/api-conventions/SKILL.md) for any task involving API routes or endpoints.
- Use [testing-standards](.agents/skills/testing-standards/SKILL.md) for any task involving tests or test coverage.

Read and follow both skills when a task involves both areas.

## Never Do These Things

- Never put business logic or SQL in routers or `src/index.js`.
- Never reintroduce the removed root JavaScript modules, generic `utils.js`, or `misc/` imports.
- Never change validation order, coercion, error messages/statuses, authentication scope, task timestamps, or email-failure persistence as part of structural cleanup.

## Build, Test, and Development Commands
- `npm install --package-lock=false`: install dependencies without creating a lockfile.
- `npm run db:seed`: create the local schema and sample data.
- `npm start`: run the API; check `/health` to confirm availability.
- `npm run dev`: run with Node's file watcher.
- `npm test`: run the Jest suite.
- `npm run test:watch`: rerun tests while developing.
- `npm run db:reset`: delete `taskr.db` and reseed; this discards local data.

No build, lint, or formatting script is configured.

## Coding Style & Naming Conventions
Follow existing CommonJS modules (`require` and `module.exports`), two-space indentation, semicolons, and single-quoted strings. Use lowercase kebab-case filenames and directories, camelCase JavaScript functions and variables, and preserve existing snake_case database columns and API fields. Retain required convention filenames such as `AGENTS.md` and `SKILL.md`. Keep changes focused and reuse existing helpers before adding abstractions.

## Testing Guidelines
Use Jest and Supertest against `src/index.js`. Set `NODE_ENV=test` before importing the app or connection to select isolated in-memory SQLite. Use `tests/helpers/database.js` for the shared production schema, fixture reset, and connection cleanup. Reset dependent rows before parent rows. Each suite must be named `tests/resource.test.js`; Jest discovers only that pattern. Keep integrations deterministic with mocks and verify persistence as well as responses. Cover validation failures, missing resources, and forwarded errors where the contract exposes them. Do not invent errors for endpoints without domain validation. Run the default parallel `npm test` before submitting. Supertest needs loopback socket access in restricted environments.

## Commit & Pull Request Guidelines
History currently contains one descriptive initial commit, so it establishes no recurring convention. The repository's `commit-push-pr` skill specifies Conventional Commits; use messages such as `fix(tasks): validate task status`. Keep commits scoped. PR descriptions should explain the change, relevant issue links, verification performed, and any API or schema implications. Invoke `$commit-push-pr` only when committing staged changes, pushing, and opening a PR are intended.
