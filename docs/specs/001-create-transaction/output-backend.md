# Create Transaction — Backend Output

**Spec:** `docs/specs/001-create-transaction/spec.md`
**Branch:** `feat/001-create-transaction-backend`
**Completed:** 2026-06-21

## Summary

Implemented REST API endpoints for providers, assets, and transactions (full CRUD) on NestJS 10 with Prisma 5.

**Endpoints delivered:**

- `POST /api/providers` — create provider (409 on duplicate name)
- `GET /api/providers` — list all providers
- `POST /api/assets` — create asset (validated against Prisma AssetType enum)
- `GET /api/assets` — list all assets
- `POST /api/transactions` — create transaction with nested asset/provider response
- `GET /api/transactions` — list all transactions with relations
- `GET /api/transactions/:id` — get single transaction (404 if not found)
- `PATCH /api/transactions/:id` — partial update (404 if not found)
- `DELETE /api/transactions/:id` — delete, returns `{ deleted: true }` (404 if not found)

**Infrastructure added:**

- `class-validator` + `class-transformer` for DTO validation
- `ValidationPipe({ whitelist: true })` in main.ts
- Jest + ts-jest + supertest for unit and e2e testing
- Jest configs for both unit (`jest.config.ts`) and e2e (`test/jest-e2e.json`)

**Database changes:**

- Added `Provider` model (id, name unique, createdAt)
- Added `currency` (default "USD") and `providerId` (optional FK) to Transaction

**Test coverage:** 17 unit tests + 8 e2e tests = 25 total, all passing.

## Decisions Made

- **cuid() for Provider IDs** — matches existing Asset/Transaction convention (spec said UUID)
- **No backend defaults** — `type`, `date`, `currency` are all required fields in DTOs; frontend sends defaults
- **Prisma enums in DTOs** — used `@prisma/client` enums for validation rather than `@foolio/types` to stay coupled to the database layer
- **Asset existence check** — `TransactionsService.create()` pre-checks asset exists and throws `BadRequestException` rather than relying on FK violation
- **`@nestjs/mapped-types`** — installed for `PartialType` in `UpdateTransactionDto`
- **Date handling** — service converts ISO date string to `Date` before Prisma insert; Prisma `Decimal` fields serialize as strings in JSON responses

## Deviations from Plan

- Added `@nestjs/mapped-types` dependency (not in original plan but needed for `PartialType`)
- Pinned `@nestjs/testing` to `^10` to match project's NestJS 10

## Unresolved / Follow-up

- Ticker validation against external API (noted as out of scope in spec)
- No duplicate asset prevention (ticker uniqueness not enforced)
