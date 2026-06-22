# 001 — Create Transaction

## Problem

As a user, I want to record buy or sell transactions against assets in my portfolio — including past transactions — so that my holdings are tracked.

## Domain

Full-stack (`apps/api` + `apps/web` + `packages/types`)

## Requirements

1. User selects an existing asset from a dropdown.
2. User can also create a new asset inline if it doesn't exist yet.
3. When creating a new asset, the ticker is validated on submit against an external financial data API (provider TBD, likely Twelvedata).
4. User selects transaction type: BUY (default) or SELL.
5. User enters quantity and price per unit.
6. User picks a date (defaults to today, can be set to any past date).
7. User selects a currency (defaults to USD).
8. User optionally selects a provider (broker/custodian).
9. User can optionally add notes.
10. Form validates required fields before submitting.
11. After submission, the transaction appears in a list.
12. User can edit an existing transaction.
13. User can delete an existing transaction.

## Data Model Changes

### New Model: Provider

| Field       | Type                     |
| ----------- | ------------------------ |
| `id`        | UUID, PK                 |
| `name`      | string, unique, required |
| `createdAt` | DateTime                 |

### Transaction — New Fields

| Field        | Type                           |
| ------------ | ------------------------------ |
| `providerId` | UUID, FK -> Provider, nullable |
| `currency`   | string, default `"USD"`        |

## API Contract

### Endpoints

| Method   | Path                    | Description              |
| -------- | ----------------------- | ------------------------ |
| `POST`   | `/api/assets`           | Create an asset          |
| `GET`    | `/api/assets`           | List all assets          |
| `POST`   | `/api/providers`        | Create a provider        |
| `GET`    | `/api/providers`        | List all providers       |
| `POST`   | `/api/transactions`     | Create a transaction     |
| `GET`    | `/api/transactions`     | List all transactions    |
| `GET`    | `/api/transactions/:id` | Get a single transaction |
| `PATCH`  | `/api/transactions/:id` | Update a transaction     |
| `DELETE` | `/api/transactions/:id` | Delete a transaction     |

### Create Transaction (`POST /api/transactions`)

```typescript
// Request
{
  assetId: string;
  type?: TransactionType;    // defaults to BUY
  quantity: number;
  price: number;
  date: string;              // ISO date, defaults to today
  currency?: string;         // defaults to "USD"
  providerId?: string;       // nullable
  notes?: string;
}

// Response: full Transaction with nested asset and provider
```

### Update Transaction (`PATCH /api/transactions/:id`)

Same shape as create, all fields optional.

### Create Asset (`POST /api/assets`)

```typescript
// Request
{
  ticker: string;
  name: string;
  type: AssetType; // STOCK | ETF | CRYPTO
}

// Response: full Asset object
```

### Create Provider (`POST /api/providers`)

```typescript
// Request
{
  name: string;
}

// Response: full Provider object
```

## Shared Types (`packages/types`)

```typescript
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}
```

## Acceptance Criteria

- [ ] Provider can be created (name only).
- [ ] Existing providers appear in a dropdown when creating a transaction.
- [ ] A transaction can be created with: asset, type, quantity, price, date, provider (optional), currency (default USD), and notes (optional).
- [ ] Transaction type defaults to BUY.
- [ ] Date defaults to today but can be set to any past date.
- [ ] Form validates all required fields (asset, quantity, price, date).
- [ ] After submission, the transaction appears in a list.
- [ ] Transactions can be edited (all fields).
- [ ] Transactions can be deleted.
- [ ] API returns proper validation errors for invalid input.

## Out of Scope

- Portfolio calculations / P&L
- Importing transactions from CSV or broker APIs
- Multi-currency portfolio aggregation (currency is tracked but no conversion)
- Provider details beyond name (address, account number, etc.)
