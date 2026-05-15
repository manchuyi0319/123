import { apiRequest } from './client';

export function fetchShopPets(): Promise<{ data: any[] }> {
  return apiRequest('/shop');
}

export function fetchWallet(): Promise<{ coins: number }> {
  return apiRequest('/shop/wallet');
}

export function fetchWalletRecords(): Promise<{ data: any[] }> {
  return apiRequest('/shop/wallet/records');
}

export function redeemCode(code: string): Promise<{ coins: number; added: number; message: string }> {
  return apiRequest('/shop/wallet/redeem', { method: 'POST', body: JSON.stringify({ code }) });
}
