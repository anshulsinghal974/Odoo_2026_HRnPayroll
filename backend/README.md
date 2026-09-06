# PeoplePay360 Backend

Node.js / Express API with Prisma and PostgreSQL. Full stack steps live in the [root README](../README.md).

## Run locally

```bash
cd backend
cp .env.example .env   # PowerShell: Copy-Item .env.example .env
```

Edit `DATABASE_URL` so it matches your Postgres user and password. Create database `peoplepay360` if it does not exist.

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev
```

- Server: http://localhost:3000
- Health: http://localhost:3000/health

Schema: `prisma/schema.prisma`. Optional Prisma Studio: `npx prisma studio`.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Nodemon + TypeScript (`src/server.ts`) |
| `npm run seed` | Demo users, employees, attendance, payruns |
| `npm run db:reset` | Drop/recreate schema, migrate, seed |
| `npm run build` / `npm start` | Compile and run `dist/server.js` |

Seed password for all demo users: `Password123!` (see root README for emails).

`ML_SERVICE_URL` should point at the ML service (default `http://localhost:8000`).
