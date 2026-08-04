# Lessons learned

Short notes from building LiveEvent Radar — what stuck with me.

## Why I built it

On brand activations I worked as a hostess, stock problems always arrived late. Someone ran out of drinks; the coordinator heard about it on WhatsApp an hour later. I wanted a browser dashboard that made that delay feel solvable — even with simulated data — and that forced me to learn live UI patterns for real.

## What went wrong (usefully)

**Hydration mismatches.** Live clocks and “elapsed” labels that called `Date.now()` during render disagreed with the server HTML. Fixing that meant `useSyncExternalStore` for share clocks and keeping decorative ticks in the DOM via refs — not fighting React.

**CI vs local npm.** The lockfile was generated with npm 11; CI on npm 10 failed `npm ci` in seconds. Pinning npm in the workflow was a boring fix that taught me lockfiles encode the package-manager major version too.

**The accidental `tatus` file.** I mistyped `git status` redirection and committed a 2k-line diff dump. Embarrassing, easy to remove, and a reminder that `git status` before every commit is not optional.

**“Portfolio depth” commits.** Early messages advertised features as recruiter bait. Rewriting those messages to describe the change — not the audience — made the history read like engineering again.

**Six clocks.** Each panel that needed “now” spun its own interval. The UI worked; the architecture did not. One shared `useNow` was the correct answer and should have been there earlier.

## What I would do differently next time

- Seed the simulator from day one — a demo that starts at 100% stock everywhere wastes the first minute of a reviewer’s attention.
- Write the integration tests (worker hook, WebSocket malformed frames) alongside the pure math tests, not after.
- Keep comments short. The product story belongs in the docs site; the code should not pitch itself.

## What I am proud of

Honest limits in the docs (what the bench does **not** claim). Tabular numbers and a11y focus states. A personal problem statement that is not generic SaaS filler.
