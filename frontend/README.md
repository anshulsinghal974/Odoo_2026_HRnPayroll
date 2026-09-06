# PeoplePay360 Frontend

React + TypeScript + Vite UI. Full stack steps live in the [root README](../README.md).

## Run locally

Backend should already be running on port 3000.

```bash
cd frontend
cp .env.example .env   # PowerShell: Copy-Item .env.example .env
npm install
npm run dev
```

`frontend/.env`:

```
VITE_API_URL=http://localhost:3000/api
```

Vite prints the app URL (typically http://localhost:5173). Restart the dev server after changing `.env`.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Oxlint |
