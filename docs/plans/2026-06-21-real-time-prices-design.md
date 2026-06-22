# Real-Time Prices Integration Design

## Overview

Add a `prices` module to the NestJS API that fetches real-time prices for stocks, ETFs, and crypto from the **Twelve Data API** — the only free-tier API covering all three asset types in a single integration.

---

## API Provider: Twelve Data

**URL:** https://twelvedata.com/

| Property     | Value                                                                     |
| ------------ | ------------------------------------------------------------------------- |
| Asset types  | Stocks, ETFs, crypto (all three)                                          |
| Free tier    | 800 req/day, 8 req/min                                                    |
| Data quality | Near real-time                                                            |
| Auth         | `apikey` query param                                                      |
| Key endpoint | `GET https://api.twelvedata.com/price?symbol=AAPL,SPY,BTC/USD&apikey=KEY` |

### Why Twelve Data over alternatives

| API             | Stocks | ETFs | Crypto  | Free req/day   | Notes                          |
| --------------- | ------ | ---- | ------- | -------------- | ------------------------------ |
| **Twelve Data** | ✅     | ✅   | ✅      | 800            | Only one that covers all three |
| Finnhub         | ✅     | ✅   | limited | 3,600 (60/min) | No good crypto                 |
| CoinGecko       | ❌     | ❌   | ✅      | ~6,000         | Crypto only                    |
| Alpha Vantage   | ✅     | ✅   | ❌      | 25             | Too restrictive                |
| yfinance        | ✅     | ✅   | ❌      | unlimited      | Unofficial scraper, unreliable |

---

## Architecture

### Prisma Schema Addition

```prisma
model Price {
  id        String   @id @default(cuid())
  assetId   String
  asset     Asset    @relation(fields: [assetId], references: [id])
  price     Decimal
  date      DateTime @db.Date   // date only — one row per asset per calendar day
  createdAt DateTime @default(now())

  @@unique([assetId, date])
}

// Add back-relation to Asset:
model Asset {
  // ...existing fields...
  prices Price[]
}
```

### Caching Strategy: DB-backed daily cache

Only fetch from Twelve Data if no `Price` row exists for today. This keeps usage well under the 800 req/day cap regardless of how often the frontend polls.

```
for each requested asset:
  if Price row exists for (assetId, today) → return DB value
  else → add to "needs fetch" list

if needs fetch:
  batch call Twelve Data with missing symbols
  upsert results into Price table (skipDuplicates)
  merge with DB hits and return
```

### Symbol Normalization

Twelve Data uses different formats for crypto vs equities:

```
STOCK  + "AAPL"  →  "AAPL"
ETF    + "SPY"   →  "SPY"
CRYPTO + "BTC"   →  "BTC/USD"
CRYPTO + "ETH"   →  "ETH/USD"
```

The DB stores plain tickers. Normalization happens only inside `PricesService` before any API call. The returned price map is keyed by the original DB ticker so callers don't need to know about Twelve Data's format.

---

## Module Structure

```
apps/api/src/prices/
  prices.config.ts       — base URL constant, env key name
  prices.types.ts        — TypeScript interfaces + type guards
  prices.service.ts      — normalization, DB cache lookup, HTTP calls, upsert
  prices.controller.ts   — two GET endpoints
  prices.module.ts       — HttpModule import, wires service + controller
```

### New dependency

```bash
pnpm --filter @foolio/api add @nestjs/axios axios
```

### Environment variable

```
TWELVE_DATA_API_KEY=your_key_here
```

Fail fast on startup if missing.

---

## API Endpoints

### `GET /api/prices/assets`

Returns prices for all assets currently in the DB. Primary endpoint for the portfolio dashboard.

- Queries all assets via `PrismaService` (globally injected)
- Calls `PricesService.getPrices()` with the full asset list
- Returns `PricesMap` keyed by ticker

### `GET /api/prices?tickers=AAPL,SPY,BTC&types=STOCK,ETF,CRYPTO`

On-demand lookup for specific tickers.

- Returns 400 if array lengths mismatch or an invalid `AssetType` value is supplied

---

## Twelve Data Response Quirks

**Single-symbol response** (when only 1 symbol is requested):

```json
{ "price": "189.30" }
```

**Multi-symbol response:**

```json
{
  "AAPL": { "price": "189.30" },
  "BTC/USD": { "price": "67000.12" }
}
```

Detect via: `'price' in data && typeof data.price === 'string'`

**Errors come back as HTTP 200** with an error object inside the payload:

```json
{ "INVALIDTICKER": { "code": 400, "message": "symbol not found" } }
```

Must filter these with a type guard and log a warning rather than crashing.

---

## Implementation Order

1. Extend Prisma schema — add `Price` model + back-relation on `Asset`
2. Run migration: `cd apps/api && pnpm prisma migrate dev --name add-price-table`
3. Install `@nestjs/axios` and `axios`
4. Create `prices.config.ts`
5. Create `prices.types.ts`
6. Create `prices.service.ts`
7. Create `prices.controller.ts`
8. Create `prices.module.ts`
9. Add `PricesModule` to `app.module.ts` imports
10. Add `TWELVE_DATA_API_KEY` to `.env` and `.env.example`

---

## Verification

```bash
# Start DB and migrate
docker-compose up -d
cd apps/api && pnpm prisma migrate dev --name add-price-table

# Start API (TWELVE_DATA_API_KEY must be in .env)
pnpm --filter @foolio/api dev

# Test endpoints
curl "http://localhost:3000/api/prices?tickers=AAPL,BTC&types=STOCK,CRYPTO"
curl "http://localhost:3000/api/prices/assets"

# Verify DB caching: call the same endpoint twice on the same day
# → second call returns immediately with no Twelve Data log output
# → inspect Price table: cd apps/api && pnpm prisma studio
```
