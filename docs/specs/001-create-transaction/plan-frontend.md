# Create Transaction — Frontend Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the transaction management UI — list, create, edit, and delete transactions with asset and provider selection.

**Architecture:** React pages and components using MUI 5. API client layer calls backend via Vite proxy (`/api/*`). Transaction form supports inline asset and provider creation. All state fetched from API (no local state management library needed).

**Tech Stack:** React 18, Vite 5, MUI 5, TypeScript

**Spec:** `docs/specs/001-create-transaction/spec.md`

**Pre-requisite:** Backend API must be running (`pnpm --filter @foolio/api dev`) for manual testing.

---

## Contract

### API Endpoints (provided by backend)

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

## Task 1: API client functions

**Files:**

- Create: `apps/web/src/api/assets.ts`
- Create: `apps/web/src/api/providers.ts`
- Create: `apps/web/src/api/transactions.ts`

**Step 1: Implement API client functions**

Each file exports typed functions that call the API via `fetch` (or the existing HTTP client pattern in the project):

- `assets.ts`: `fetchAssets()`, `createAsset(dto)`
- `providers.ts`: `fetchProviders()`, `createProvider(dto)`
- `transactions.ts`: `fetchTransactions()`, `fetchTransaction(id)`, `createTransaction(dto)`, `updateTransaction(id, dto)`, `deleteTransaction(id)`

All functions should:

- Use `/api/...` paths (Vite proxy handles forwarding)
- Set `Content-Type: application/json` for POST/PATCH
- Throw on non-ok responses with the error body
- Return typed responses

**Step 2: Commit**

```bash
git add apps/web/src/api/
git commit -m "feat: add API client functions for assets, providers, transactions"
```

---

## Task 2: Transaction list page

**Files:**

- Create: `apps/web/src/pages/TransactionsPage.tsx`
- Modify: `apps/web/src/App.tsx` (add route)

**Step 1: Implement TransactionsPage**

- Fetch and display transactions in an MUI `Table`
- Show columns: date, asset ticker, type (BUY/SELL), quantity, price, currency, provider, notes
- Add "New Transaction" button at the top
- Add edit (pencil icon) and delete (trash icon) action buttons per row
- Empty state: show a message like "No transactions yet" with a CTA to create one

**Step 2: Add route**

Add route in `App.tsx` for `/transactions`.

**Step 3: Manual test**

Run: `pnpm dev`
Navigate to `http://localhost:5173/transactions`
Expected: page renders (empty list if no data)

**Step 4: Commit**

```bash
git add apps/web/src/pages/TransactionsPage.tsx apps/web/src/App.tsx
git commit -m "feat: add transactions list page"
```

---

## Task 3: Transaction form (create + edit)

**Files:**

- Create: `apps/web/src/components/TransactionForm.tsx`
- Modify: `apps/web/src/pages/TransactionsPage.tsx` (wire up form)

**Step 1: Implement TransactionForm**

MUI form in a Dialog with:

- **Asset**: Autocomplete dropdown (fetched from `/api/assets`) + "Add new" option that opens inline fields (ticker, name, type)
- **Transaction type**: Select, defaults to BUY
- **Quantity**: number input, required
- **Price**: number input, required
- **Date**: MUI DatePicker, defaults to today, allows past dates
- **Currency**: Select from Currency enum values, defaults to USD
- **Provider**: optional Autocomplete (fetched from `/api/providers`) + "Add new" option
- **Notes**: optional multiline TextField
- Submit and Cancel buttons
- Client-side validation: asset, quantity, price, and date are required

The form accepts an optional `transaction` prop for edit mode (pre-fills all fields).

**Step 2: Wire into TransactionsPage**

- "New Transaction" button opens the form dialog
- Edit action button opens the form dialog pre-filled with existing transaction data
- On submit: call `createTransaction` or `updateTransaction`, close dialog, refresh list

**Step 3: Manual test**

Run: `pnpm dev`
Test: create a transaction, edit it, verify changes persist

**Step 4: Commit**

```bash
git add apps/web/src/components/TransactionForm.tsx apps/web/src/pages/TransactionsPage.tsx
git commit -m "feat: add transaction form with create and edit"
```

---

## Task 4: Delete transaction + polish

**Files:**

- Modify: `apps/web/src/pages/TransactionsPage.tsx`

**Step 1: Implement delete**

- Delete button shows MUI confirmation Dialog ("Are you sure you want to delete this transaction?")
- On confirm, calls `deleteTransaction(id)` and refreshes list
- Show MUI Snackbar on success

**Step 2: Polish**

- Loading state on form submission (disable submit button, show spinner)
- Error handling: show API validation errors in a Snackbar or inline
- Loading skeleton while fetching transactions

**Step 3: Manual test**

Run: `pnpm dev`
Test full flow: create, edit, delete transactions

**Step 4: Commit**

```bash
git add apps/web/src/
git commit -m "feat: add delete confirmation and polish transaction UI"
```
