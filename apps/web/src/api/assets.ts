import { Asset, AssetType } from '@foolio/types';
import { get, post } from './client';

export function fetchAssets(): Promise<Asset[]> {
  return get<Asset[]>('/api/assets');
}

export function createAsset(dto: {
  ticker: string;
  name: string;
  type: AssetType;
}): Promise<Asset> {
  return post<Asset>('/api/assets', dto);
}
