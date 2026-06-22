import { Transaction, TransactionType } from '@foolio/types';
import { get, post, patch, del } from './client';

export interface CreateTransactionDto {
  assetId: string;
  type?: TransactionType;
  quantity: number;
  price: number;
  date: string;
  currency?: string;
  providerId?: string | null;
  notes?: string;
}

export function fetchTransactions(): Promise<Transaction[]> {
  return get<Transaction[]>('/api/transactions');
}

export function fetchTransaction(id: string): Promise<Transaction> {
  return get<Transaction>(`/api/transactions/${id}`);
}

export function createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
  return post<Transaction>('/api/transactions', dto);
}

export function updateTransaction(
  id: string,
  dto: Partial<CreateTransactionDto>,
): Promise<Transaction> {
  return patch<Transaction>(`/api/transactions/${id}`, dto);
}

export function deleteTransaction(id: string): Promise<{ deleted: true }> {
  return del<{ deleted: true }>(`/api/transactions/${id}`);
}
