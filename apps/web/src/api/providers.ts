import { Provider } from '@foolio/types';
import { get, post } from './client';

export function fetchProviders(): Promise<Provider[]> {
  return get<Provider[]>('/api/providers');
}

export function createProvider(dto: { name: string }): Promise<Provider> {
  return post<Provider>('/api/providers', dto);
}
