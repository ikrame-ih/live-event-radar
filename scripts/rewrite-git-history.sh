#!/usr/bin/env bash
# Optional history cleanup for LiveEvent Radar (solo portfolio repo).
# Review each step before running. Requires: git-filter-repo
#
# This script is intentionally NOT run by CI. You run it once locally, then:
#   git push --force-with-lease origin main
#   git push origin --delete portfolio/engineering-depth

set -euo pipefail

echo "1) Delete local portfolio branch if present"
git branch -D portfolio/engineering-depth 2>/dev/null || true

echo "2) Purge accidental 'tatus' blob from all history"
git filter-repo --invert-paths --path tatus --force

echo "3) Rewrite portfolio-optics commit messages (edit the map as needed)"
# Example using filter-repo message callback — adjust hashes after step 2.
# Prefer interactive: git rebase and reword offending commits instead if the
# history is small enough.

cat <<'EOF'

Manual reword targets (find new SHAs after filter-repo):
  - "Raise portfolio depth: ..." → "feat: move throughput math to a Web Worker and cap the buffer with a ring"
  - "docs: enable Mermaid and align README with recruiter case study" → "docs: enable Mermaid and link README to the case study"
  - Merge PR bodies that repeat "portfolio depth"

Then:
  git push --force-with-lease origin main
  git push origin --delete portfolio/engineering-depth

.gitmailmap already unifies author display names for git log.
EOF
