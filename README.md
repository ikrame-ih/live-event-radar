# LiveEvent Radar

Front-end prototype for monitoring live telemetry-style events during events (stands, SKU movement, KPIs).

## Stack

Next.js · React · TypeScript · Tailwind CSS · Zustand · Flowbite React

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard mock stream is at `/dashboard`.

## Scripts

| Command           | Purpose              |
|-------------------|----------------------|
| `npm run dev`     | Development server    |
| `npm run build`   | Production build      |
| `npm run lint`    | ESLint               |
| `npm run format`  | Prettier write       |

## Author

Ikrame Ibn Hayoun

## Publishing to GitHub

1. Create a **private** repo named `live-event-radar` under your GitHub account (no README/license/gitignore templates if you already have commits locally).
2. From this project folder:

```bash
git remote add origin https://github.com/<your-username>/live-event-radar.git
git push -u origin main
```

If `origin` already exists, use `git remote set-url origin <url>` instead.
