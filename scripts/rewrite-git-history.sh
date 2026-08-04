#!/bin/sh
# One-shot history hygiene for this solo portfolio repo.
# Does NOT change file contents except removing the accidental `tatus` path.
# After running:
#   git push --force-with-lease origin main
#
# Requires Git for Windows bash. Do not run from CI.

set -euo pipefail
export FILTER_BRANCH_SQUELCH_WARNING=1

echo "==> Purging path 'tatus' from all commits"
git filter-branch -f --index-filter \
  'git rm --cached --ignore-unmatch tatus' \
  --prune-empty --tag-name-filter cat -- --all

echo "==> Unifying author/committer names to Ikrame Ibn Hayoun"
git filter-branch -f --env-filter '
CORRECT_NAME="Ikrame Ibn Hayoun"
CORRECT_EMAIL="ikihga2223@gmail.com"
export GIT_AUTHOR_NAME="$CORRECT_NAME"
export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
export GIT_COMMITTER_NAME="$CORRECT_NAME"
export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
' --tag-name-filter cat -- --branches --tags

echo "==> Done. Inspect with: git log --format=\"%an <%ae> | %s\" -15"
echo "    Then: git push --force-with-lease origin main"
echo "    Optional cleanup: git for-each-ref --format=\"%(refname)\" refs/original/ | xargs -n1 git update-ref -d"
