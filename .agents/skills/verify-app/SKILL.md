---
name: verify-app
description: Run Taskr's full serial API verification suite after significant changes, fix implementation regressions, and report endpoint verification results.
---

# Verify Taskr

After any significant change, run the complete verification suite from the repository root:

```bash
npm test -- --runInBand
```

This runs all Jest suites serially. The suites use Supertest against the Express app and isolated in-memory SQLite and exercise all current API endpoints directly. No separate server or database seeding is required. Supertest still needs local socket binding; if execution is blocked by permissions or missing dependencies, report the blocker and obtain the required execution access rather than treating it as an application failure.

## Resolve Failures

Inspect every failed test and its diagnostics. Fix implementation defects within the requested change's scope, preserving existing API contracts and unrelated work. Follow the repository's API conventions and testing standards when relevant. Do not weaken assertions, skip failing tests, or change expected behavior merely to make the suite pass.

Rerun the full command after each fix until all tests pass. If a failure cannot be resolved without missing information, unavailable infrastructure, or an out-of-scope behavior change, stop and report the specific remaining failures and what is needed to address them. Avoid repeating the same unsuccessful fix without new evidence.

## Report Results

- On success, report: **All tests passing; all current endpoints verified by the API test suite.** Include the actual suite/test counts from the completed run.
- On failure, identify the failing suites/tests, affected endpoints where known, error details, fixes attempted, and remaining action needed. Distinguish application failures from environment blockers and pre-existing failures.

Passing tests verify the behaviors covered by the suite. They do not independently prove production deployment, real external integrations, or the standalone server's listening/startup configuration. Do not claim those were checked unless separately executed.
