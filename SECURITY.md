# Security Policy

LiveEvent Radar is a **frontend-only** demo (Next.js). There is no server-side API or database in this repository.

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |

## Reporting a vulnerability

If you find a security issue, please **do not** open a public GitHub issue with exploit details.

Instead:

1. Email or DM the maintainer via [GitHub profile](https://github.com/ikrame-ih) or [LinkedIn](https://www.linkedin.com/in/ikrame-ih/).
2. Include a short description, steps to reproduce, and impact (e.g. XSS, unsafe WebSocket handling, dependency issue in the app bundle).
3. Allow a reasonable time to respond before public disclosure.

## Scope (what belongs here)

- Cross-site scripting or unsafe rendering in the React UI
- Client-side data handling (WebSocket payloads, env var misuse)
- Dependencies shipped to the production Next.js build
- Misconfiguration that could expose secrets via `NEXT_PUBLIC_*` variables

## Out of scope

- The optional external WebSocket server (not part of this repo)
- VitePress dev-server advisories that only affect local `docs:dev`
- Social engineering or physical access scenarios

## Safe use notes

- Never put API keys, tokens, or passwords in `NEXT_PUBLIC_*` environment variables — they are embedded in the browser bundle.
- When connecting a real feed, use `wss://` and authenticate on the server, not in client-only secrets.
