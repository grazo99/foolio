export enum AssetType {
  STOCK = 'STOCK',
  ETF = 'ETF',
  CRYPTO = 'CRYPTO',
}

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  type: AssetType;
  createdAt: string;
}

export interface Provider {
  id: string;
  name: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  assetId: string;
  asset: Asset;
  type: TransactionType;
  quantity: number;
  price: number;
  date: string;
  currency: string;
  providerId: string | null;
  provider: Provider | null;
  notes: string | null;
  createdAt: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}
