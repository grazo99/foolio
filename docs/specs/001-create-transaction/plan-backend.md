# Create Transaction — Backend Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement REST API endpoints for assets, providers, and transactions (full CRUD).

**Architecture:** NestJS modules for providers, assets (create+list), and transactions (full CRUD). Prisma schema updated with Provider model and new Transaction fields (currency, providerId). All transaction queries include nested asset and provider.

**Tech Stack:** NestJS 10, Prisma 5, TypeScript, class-validator

**Spec:** `docs/specs/001-create-transaction/spec.md`

---

## Contract

### API Endpoints

| Method   | Path                    | Request Body                                                                | Response                              |
| -------- | ----------------------- | --------------------------------------------------------------------------- | ------------------------------------- |
| `POST`   | `/api/assets`           | `{ ticker, name, type }`                                                    | Asset                                 |
| `GET`    | `/api/assets`           | —                                                                           | Asset[]                               |
| `POST`   | `/api/providers`        | `{ name }`                                                                  | Provider                              |
| `GET`    | `/api/providers`        | —                                                                           | Provider[]                            |
| `POST`   | `/api/transactions`     | `{ assetId, type?, quantity, price, date, currency?, providerId?, notes? }` | Transaction (with asset & provider)   |
| `GET`    | `/api/transactions`     | —                                                                           | Transaction[] (with asset & provider) |
| `GET`    | `/api/transactions/:id` | —                                                                           | Transaction (with asset & provider)   |
| `PATCH`  | `/api/transactions/:id` | Partial of create body                                                      | Transaction (with asset & provider)   |
| `DELETE` | `/api/transactions/:id` | —                                                                           | `{ deleted: true }`                   |

**Defaults:** `type` → `BUY`, `date` → today, `currency` → `USD`

---

## Task 1: Prisma schema — Provider model + Transaction fields

**Files:**

- Modify: `apps/api/prisma/schema.prisma`

**Step 1: Add Provider model and update Transaction**

Add to schema:

```prisma
model Provider {
  id           String        @id @default(uuid())
  name         String        @unique
  createdAt    DateTime      @default(now())
  transactions Transaction[]
}
```

Add to Transaction model:

```prisma
  currency   String    @default("USD")
  provider   Provider? @relation(fields: [providerId], references: [id])
  providerId String?
```

**Step 2: Generate and run migration**

Run: `cd apps/api && pnpm prisma migrate dev --name add-provider-and-transaction-fields`
Expected: Migration applied successfully

**Step 3: Verify Prisma client generation**

Run: `cd apps/api && pnpm prisma generate`
Expected: SUCCESS

**Step 4: Commit**

```bash
git add apps/api/prisma/
git commit -m "feat: add Provider model and currency/provider fields to Transaction"
```

---

## Task 2: Provider module — CRUD

**Files:**

- Create: `apps/api/src/providers/providers.module.ts`
- Create: `apps/api/src/providers/providers.controller.ts`
- Create: `apps/api/src/providers/providers.service.ts`
- Create: `apps/api/src/providers/dto/create-provider.dto.ts`
- Modify: `apps/api/src/app.module.ts` (import ProvidersModule)

**Step 1: Write the failing test**

Create: `apps/api/src/providers/providers.controller.spec.ts`

Test that:

- `POST /providers` with `{ name: "Fidelity" }` returns 201 with provider object
- `GET /providers` returns array of providers
- `POST /providers` with duplicate name returns 409

**Step 2: Run test to verify it fails**

Run: `cd apps/api && pnpm jest providers.controller.spec --verbose`
Expected: FAIL (modules not found)

**Step 3: Implement DTO, service, controller, module**

- `CreateProviderDto`: `name: string` with `@IsString()` and `@IsNotEmpty()` validators
- `ProvidersService`: `create(dto)` and `findAll()` using PrismaService
- `ProvidersController`: `@Post()` and `@Get()` endpoints
- `ProvidersModule`: imports PrismaModule, provides service, declares controller
- Register in `AppModule`

**Step 4: Run test to verify it passes**

Run: `cd apps/api && pnpm jest providers.controller.spec --verbose`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/providers/ apps/api/src/app.module.ts
git commit -m "feat: add providers module with create and list endpoints"
```

---

## Task 3: Assets module — Create and List endpoints

**Files:**

- Create: `apps/api/src/assets/dto/create-asset.dto.ts` (if not exists)
- Modify: `apps/api/src/assets/assets.controller.ts` (add POST and GET)
- Modify: `apps/api/src/assets/assets.service.ts` (add create and findAll)

**Step 1: Write the failing test**

Create or modify: `apps/api/src/assets/assets.controller.spec.ts`

Test that:

- `POST /assets` with `{ ticker: "AAPL", name: "Apple Inc.", type: "STOCK" }` returns 201
- `GET /assets` returns array of assets
- `POST /assets` with missing fields returns 400

**Step 2: Run test to verify it fails**

Run: `cd apps/api && pnpm jest assets.controller.spec --verbose`
Expected: FAIL

**Step 3: Implement**

- `CreateAssetDto`: `ticker`, `name`, `type` with class-validator decorators
- `AssetsService`: `create(dto)` and `findAll()` using PrismaService
- `AssetsController`: `@Post()` and `@Get()` endpoints
- Note: Ticker validation against external API is out of scope for this task (will be added later)

**Step 4: Run test to verify it passes**

Run: `cd apps/api && pnpm jest assets.controller.spec --verbose`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/assets/
git commit -m "feat: add asset create and list endpoints"
```

---

## Task 4: Transactions module — Full CRUD

**Files:**

- Create: `apps/api/src/transactions/dto/create-transaction.dto.ts`
- Create: `apps/api/src/transactions/dto/update-transaction.dto.ts`
- Modify: `apps/api/src/transactions/transactions.controller.ts`
- Modify: `apps/api/src/transactions/transactions.service.ts`

**Step 1: Write the failing test**

Create or modify: `apps/api/src/transactions/transactions.controller.spec.ts`

Test that:

- `POST /transactions` creates a transaction with defaults (type=BUY, currency=USD, date=today)
- `GET /transactions` returns list with nested asset and provider
- `GET /transactions/:id` returns single transaction
- `PATCH /transactions/:id` updates fields
- `DELETE /transactions/:id` deletes and returns `{ deleted: true }`
- `POST /transactions` with invalid assetId returns 400
- `POST /transactions` with missing required fields returns 400

**Step 2: Run test to verify it fails**

Run: `cd apps/api && pnpm jest transactions.controller.spec --verbose`
Expected: FAIL

**Step 3: Implement**

- `CreateTransactionDto`: `assetId` (required), `type?` (defaults BUY), `quantity`, `price`, `date?` (defaults today), `currency?` (defaults USD), `providerId?`, `notes?`
- `UpdateTransactionDto`: PartialType of CreateTransactionDto
- `TransactionsService`: `create`, `findAll`, `findOne`, `update`, `remove` — all queries include `{ asset: true, provider: true }`
- `TransactionsController`: full CRUD with proper HTTP status codes

**Step 4: Run test to verify it passes**

Run: `cd apps/api && pnpm jest transactions.controller.spec --verbose`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/transactions/
git commit -m "feat: add full CRUD for transactions"
```

---

## Task 5: Backend integration test (e2e)

**Files:**

- Create: `apps/api/test/transactions.e2e-spec.ts`

**Step 1: Write e2e test**

Full flow:

1. Create a provider
2. Create an asset
3. Create a transaction linking both
4. List transactions and verify it's there
5. Update the transaction
6. Delete the transaction
7. Verify it's gone

**Step 2: Run e2e test**

Run: `cd apps/api && pnpm jest --config jest-e2e.json transactions.e2e --verbose`
Expected: PASS (all prior tasks must be complete)

**Step 3: Commit**

```bash
git add apps/api/test/
git commit -m "test: add transactions e2e test"
```
