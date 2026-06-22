# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start all apps in parallel (dev mode)
pnpm dev

# Build all (packages first, then apps)
pnpm build

# Lint all packages
pnpm lint

# Target a specific app
pnpm --filter @foolio/api dev
pnpm --filter @foolio/web dev
pnpm --filter @foolio/types build
```

### Database

```bash
# Start PostgreSQL container
docker-compose up -d

# Run Prisma migrations
cd apps/api && pnpm prisma migrate dev

# Open Prisma Studio
cd apps/api && pnpm prisma studio
```

## Architecture

**Monorepo** managed with pnpm workspaces. Two apps, one shared package:

- `apps/api` — NestJS 10 REST API (port 3000), Prisma 5 ORM, JWT auth
- `apps/web` — React 18 + Vite 5 + MUI 5 frontend (port 5173)
- `packages/types` — Shared TypeScript enums (`AssetType`, `TransactionType`)

**Request flow**: `web (5173) → Vite proxy /api → NestJS (3000) → Prisma → PostgreSQL`

The Vite dev server proxies all `/api/*` requests to `localhost:3000`. NestJS has a global `/api` prefix and CORS enabled for `localhost:5173`.

### Backend (apps/api)

NestJS module structure:

- `src/prisma/` — PrismaModule (global), PrismaService connects on init
- `src/auth/` — JWT authentication
- `src/assets/` — Asset CRUD
- `src/transactions/` — Transaction CRUD
- `src/portfolio/` — Portfolio calculations

### Database Schema

Two models:

- **Asset** — `id`, `ticker`, `name`, `type (STOCK|ETF|CRYPTO)`, `createdAt`; has many Transactions
- **Transaction** — `id`, `assetId`, `type (BUY|SELL)`, `quantity`, `price`, `date`, `notes?`, `createdAt`

### Environment

Copy `.env.example` to `.env` in the repo root (Prisma reads from `apps/api/.env` or the root):

```
DATABASE_URL="postgresql://foolio:foolio@localhost:5432/foolio"
JWT_SECRET="change-me"
```

The Docker Compose service uses `foolio/foolio` credentials and exposes port `5432`.

## Project Context

Single-user personal portfolio tracker. Manual transaction entry only. USD only. No multi-tenancy or multi-currency logic needed.
