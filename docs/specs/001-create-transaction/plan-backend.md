# Create Transaction — Backend Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement REST API endpoints for assets, providers, and transactions (full CRUD).

**Architecture:** NestJS modules for providers, assets (create+list), and transactions (full CRUD). Prisma schema updated with Provider model and new Transaction fields (currency, providerId). All transaction queries include nested asset and provider.

**Tech Stack:** NestJS 10, Prisma 5, TypeScript, class-validator

**Spec:** `docs/specs/001-create-transaction/spec.md`

---

## Contract

### API Endpoints

| Method   | Path                    | Request Body                                                              | Response                              |
| -------- | ----------------------- | ------------------------------------------------------------------------- | ------------------------------------- |
| `POST`   | `/api/assets`           | `{ ticker, name, type }`                                                  | Asset                                 |
| `GET`    | `/api/assets`           | —                                                                         | Asset[]                               |
| `POST`   | `/api/providers`        | `{ name }`                                                                | Provider                              |
| `GET`    | `/api/providers`        | —                                                                         | Provider[]                            |
| `POST`   | `/api/transactions`     | `{ assetId, type, quantity, price, date, currency, providerId?, notes? }` | Transaction (with asset & provider)   |
| `GET`    | `/api/transactions`     | —                                                                         | Transaction[] (with asset & provider) |
| `GET`    | `/api/transactions/:id` | —                                                                         | Transaction (with asset & provider)   |
| `PATCH`  | `/api/transactions/:id` | Partial of create body                                                    | Transaction (with asset & provider)   |
| `DELETE` | `/api/transactions/:id` | —                                                                         | `{ deleted: true }`                   |

**Defaults handled by frontend:** `type` → `BUY`, `date` → today, `currency` → `USD`

---

## Task 0: Infrastructure — Dependencies, ValidationPipe, Jest configs

**Goal:** Set up all prerequisites so subsequent tasks can use validation and testing.

**Step 1: Install production dependencies**

Run: `cd apps/api && pnpm add class-validator class-transformer`

**Step 2: Install test dependencies**

Run: `cd apps/api && pnpm add -D jest ts-jest @types/jest @nestjs/testing supertest @types/supertest`

**Step 3: Add ValidationPipe to main.ts**

Modify `apps/api/src/main.ts` — add:

```typescript
import { ValidationPipe } from '@nestjs/common';
// ... inside bootstrap():
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

**Step 4: Create jest.config.ts**

Create `apps/api/jest.config.ts`:

```typescript
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};

export default config;
```

**Step 5: Create jest-e2e.json**

Create `apps/api/test/jest-e2e.json`:

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" }
}
```

**Step 6: Verify jest runs**

Run: `cd apps/api && pnpm jest --version`
Expected: version number printed

**Step 7: Commit**

```bash
git add apps/api/package.json apps/api/src/main.ts apps/api/jest.config.ts apps/api/test/jest-e2e.json pnpm-lock.yaml
git commit -m "chore: add validation, testing deps, jest configs"
```

---

## Task 1: Prisma schema — Provider model + Transaction fields

**Files:**

- Modify: `apps/api/prisma/schema.prisma`

**Step 1: Add Provider model and update Transaction**

Add to schema:

```prisma
model Provider {
  id           String        @id @default(cuid())
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
- `ProvidersService`:
  - `create(dto)`: wraps `prisma.provider.create` in try/catch — catches Prisma `P2002` (unique constraint) and throws `ConflictException`
  - `findAll()`: returns all providers
- `ProvidersController`: `@Post()` and `@Get()` endpoints
- `ProvidersModule`: provides service, declares controller
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

- `CreateAssetDto`: `ticker`, `name`, `type` with class-validator decorators. Use `@IsEnum(AssetType)` with the Prisma-generated enum.
- `AssetsService`: `create(dto)` and `findAll()` using PrismaService
- `AssetsController`: `@Post()` and `@Get()` endpoints
- Create `AssetsModule`, register in `AppModule`
- Note: Ticker validation against external API is out of scope for this task (will be added later)

**Step 4: Run test to verify it passes**

Run: `cd apps/api && pnpm jest assets.controller.spec --verbose`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/assets/ apps/api/src/app.module.ts
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

- `POST /transactions` creates a transaction (all required fields sent by caller)
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

- `CreateTransactionDto`: `assetId` (required), `type` (required, `@IsEnum(TransactionType)`), `quantity` (required), `price` (required), `date` (required, ISO string), `currency` (required, `@IsString()`), `providerId?` (optional), `notes?` (optional)
- `UpdateTransactionDto`: PartialType of CreateTransactionDto
- `TransactionsService`:
  - `create`: verify asset exists first (`prisma.asset.findUnique`), throw `BadRequestException` if not found. Parse `date` string to `Date` before Prisma insert. Include `{ asset: true, provider: true }` in response.
  - `findAll`: include `{ asset: true, provider: true }`
  - `findOne`: include `{ asset: true, provider: true }`, throw `NotFoundException` if not found
  - `update`: throw `NotFoundException` if not found, include relations in response
  - `remove`: throw `NotFoundException` if not found, return `{ deleted: true }`
- `TransactionsController`: full CRUD with proper HTTP status codes
- Create `TransactionsModule`, register in `AppModule`

**Step 4: Run test to verify it passes**

Run: `cd apps/api && pnpm jest transactions.controller.spec --verbose`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/api/src/transactions/ apps/api/src/app.module.ts
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

Run: `cd apps/api && pnpm jest --config test/jest-e2e.json transactions.e2e --verbose`
Expected: PASS (all prior tasks must be complete)

**Step 3: Commit**

```bash
git add apps/api/test/
git commit -m "test: add transactions e2e test"
```
