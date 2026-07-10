# DeepSource setup

[DeepSource](https://deepsource.com/) is optional static analysis on top of ESLint. It runs on commits and PRs when the GitHub app is connected to this repository.

## One-time setup

1. Sign in at [app.deepsource.com](https://app.deepsource.com/) with GitHub.
2. **Add repository** → select `ikrame-ih/live-event-radar`.
3. Ensure `.deepsource.toml` is on `main` (this repo includes it).
4. In **Settings → Code Review**, enable the **JavaScript** analyzer and code review.

## After each push

Open the DeepSource check on the commit or PR. Fix **blocking** issues in the Issues tab; ignore false positives via the dashboard or by updating `exclude_patterns` in `.deepsource.toml`.

## Common check failures

### Metrics (doc coverage, etc.)

On a small portfolio repo, metric gates can fail before coverage is uploaded.

**Settings → Metrics reporting** → lower thresholds or disable enforcement until you add coverage reporting. Code issues and metric gates are configured separately.

If the message says “failing metrics”, open **Settings → Metrics reporting** and either disable **Fail check** for each metric, or lower thresholds to `0`. Also check the **Metrics** tab — a red metric tile blocks the check even when all code issues are ignored.

### Minor anti-patterns (false positives)

Examples: `JS-0067` (module-level constants in React), `JS-R1005`, `JS-0415`, `JS-0833`.

**Settings → Issue reporting → Anti-pattern** → disable **Fail check** for **Minor** severity. Repeat for **Bug risk → Minor**.

Alternatively, on the **Issues** tab: **Actions → Ignore this issue → For this repository** on each rule.

## Local CLI (optional)

Install from [DeepSource CLI releases](https://github.com/deepsourcecorp/cli/releases), then run `deepsource report --analyzer test-coverage` after generating coverage. Most workflow is dashboard-driven; CI uses the GitHub app automatically.
