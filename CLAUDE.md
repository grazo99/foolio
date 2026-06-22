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

## Spec-Driven Development Workflow

All feature work follows a spec-driven workflow. Specs live in `docs/specs/`.

### Folder Structure

```
docs/
  specs/
    <id>-<name>/          e.g. 001-portfolio-positions/
      spec.md             Requirements + acceptance criteria (you write this)
      plan.md             Approved implementation plan (you write + approve this)
      output.md           Written by the agent when work is complete
  plans/
    *.md                  Design documents
  _TEMPLATE/              Copy this when creating a new spec
```

### Naming

- `<id>` is zero-padded: `001`, `002`, …
- `<name>` is kebab-case: `portfolio-positions`, `auth-flow`

### File Purposes

- **`spec.md`** — requirements and acceptance criteria only. No implementation details.
- **`plan.md`** — approved implementation plan. Must exist and be approved before an agent
  starts work. For full-stack specs, includes a **Contract** section that defines API
  endpoints and shared types committed to `packages/types`.
- **`output.md`** — written by the agent on completion. Summarizes what was built,
  decisions made, deviations from plan, and anything unresolved.

### Skills

- `/write-spec` — guides you through writing `spec.md` + `plan.md` for a new spec.
- `/work-on-spec <id>` — executes a spec: creates a worktree + branch, runs the plan,
  writes `output.md`.

### Full-Stack Specs

When a spec involves both `apps/api` and `apps/web`:

1. `plan.md` defines the API contract (endpoints + types) and assigns tasks to each agent.
2. Agreed types are committed to `packages/types` before agents start — this is the
   shared source of truth.
3. Two agents run in parallel: `work-on-spec <id> --scope backend` and
   `work-on-spec <id> --scope frontend`.
4. Each agent works on its own git worktree and writes its section of `output.md`.
5. Agents do not communicate directly — `packages/types` and `plan.md` are the interface.

### Branch Naming

`feat/<id>-<name>` — e.g. `feat/001-portfolio-positions`

For scoped agents: `feat/<id>-<name>-backend` and `feat/<id>-<name>-frontend`.
