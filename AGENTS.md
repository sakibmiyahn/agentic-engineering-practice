# Repository Guidelines

## Project Structure & Module Organization
Taskr is a Node.js REST API using Express and SQLite through `better-sqlite3`. Source files live at the repository root: `index.js` initializes the app, `routes.js` defines most endpoints, and `DB.js` manages the database connection. User logic lives in `UserController.js`; task queries and project helpers live in `get-tasks.js` and `projectHelpers.js`. Reuse existing helpers and middleware where appropriate, subject to the restrictions below. `db/seed.js` initializes sample data. Tests and their schema helper live in `tests/`. Repository-specific Codex skills live in `.agents/skills/`. There is no frontend or assets directory.

This codebase intentionally contains structural problems for a future refactor: oversized route handlers, mixed routing and database responsibilities, inconsistent module organization, and circular dependencies. The layout above describes the current state, not a target architecture. Avoid extending these patterns or introducing new dependency cycles. Keep changes focused, preserve behavior, and leave broader restructuring to an explicitly requested refactor.

## Available Skills

- Use [api-conventions](.agents/skills/api-conventions/SKILL.md) for any task involving API routes or endpoints.
- Use [testing-standards](.agents/skills/testing-standards/SKILL.md) for any task involving tests or test coverage.

Read and follow both skills when a task involves both areas.

## Never Do These Things

- Never add new route logic to `routes.js`; it is already too large. Put new routes in a dedicated route file.
- Never add a new utility function to `utils.js` without first checking whether it belongs in a more specific module.
- Never introduce imports from files in `misc/`; that code is dead and scheduled for removal.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run db:seed`: create the local schema and sample data.
- `npm start`: run the API; check `/health` to confirm availability.
- `npm run dev`: run with Node's file watcher.
- `npm test`: run the Jest suite.
- `npm run test:watch`: rerun tests while developing.
- `npm run db:reset`: delete `taskr.db` and reseed; this discards local data.

No build, lint, or formatting script is configured.

## Coding Style & Naming Conventions
Follow existing CommonJS modules (`require` and `module.exports`), two-space indentation, semicolons, and single-quoted strings. Use camelCase for JavaScript functions and variables; preserve existing snake_case database columns and API fields. Existing filenames vary; avoid renaming unrelated modules. Keep changes focused and reuse existing helpers before adding abstractions.

## Testing Guidelines
Use Jest and Supertest for endpoint behavior. Set `NODE_ENV=test` before importing the app or database to use in-memory SQLite. Initialize through `tests/schema.js` and reset fixtures between tests. Test files must follow the `resource.test.js` naming pattern, for example `tests/tasks.test.js`. The current inconsistent naming in `tests/` is a known problem that will be standardized; do not copy those legacy naming patterns. Existing legacy names are explicitly configured in `package.json`. Cover changed behavior, validation failures, and missing resources. No coverage threshold is configured. Run `npm test` before submitting.

## Commit & Pull Request Guidelines
History currently contains one descriptive initial commit, so it establishes no recurring convention. The repository's `commit-push-pr` skill specifies Conventional Commits; use messages such as `fix(tasks): validate task status`. Keep commits scoped. PR descriptions should explain the change, relevant issue links, verification performed, and any API or schema implications. Invoke `$commit-push-pr` only when committing staged changes, pushing, and opening a PR are intended.
