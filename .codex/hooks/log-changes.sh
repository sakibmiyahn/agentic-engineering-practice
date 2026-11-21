#!/bin/sh
set -eu

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

files=$(
  {
    git diff HEAD --name-only
    git ls-files --others --exclude-standard
  } | sort -u | tr '\n' ' '
)

printf '%s — files modified: %s\n' \
  "$(date '+%Y-%m-%d %H:%M:%S')" \
  "$files" >> .codex/hook.log

printf '{}\n'
