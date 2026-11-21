---
name: commit-push-pr
description: Commit all staged changes with a Conventional Commit message, push the current branch, and open a GitHub pull request when requested.
---

Perform these steps in order from the repository root:

1. Run `git status` and show what will be committed. Commit only staged changes; do not stage additional files.
2. Run `git diff --staged` (the valid syntax for reviewing staged changes) and review the entire staged diff. If nothing is staged, stop and report that there is nothing to commit.
3. Write a Conventional Commit message based on the staged changes, using `type(scope): summary` or `type: summary`, with an optional explanatory body. Choose the type and scope from the actual changes and repository conventions.
4. Run `git commit` with that message. For a multiline message, write it to a temporary file and use `git commit --file <path>`. If a hook or commit fails, stop and report the failure; do not bypass hooks or include additional changes.
5. Determine the current branch with `git branch --show-current`. If the result is empty (detached HEAD), stop and report it. Run `git push origin "<current-branch>"`. Do not force-push. If pushing fails, stop before creating the pull request.
6. Run `gh pr create --fill --body-file <message-file>`, where the file contains the full message from the new commit, obtainable with `git log -1 --format=%B`. Keep `--fill` to generate the title and other defaults; `--body-file` explicitly makes the PR body the commit message because `--fill` alone can use multiple commits. Do not supply a different head branch: use the current branch and the repository's default PR base. If creation fails, report the error and retain the successful commit and push without repeating them.

Finish by reporting the commit hash, branch, and pull request URL, plus any failure that prevented completion. Remove temporary message files after use. Do not execute this workflow merely when asked to create or edit this skill.
