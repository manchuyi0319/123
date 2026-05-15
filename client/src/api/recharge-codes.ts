import { apiRequest } from './client';

export function generateRechargeCodes(data: { coins: number; count: number }): Promise<{ codes: string[]; coins: number; count: number }> {
  return apiRequest('/recharge-codes/generate', { method: 'POST', body: JSON.stringify(data) });
}

export function fetchRechargeCodes(params?: { is_used?: string }): Promise<{ data: any[] }> {
  const query = params?.is_used !== undefined ? `?is_used=${params.is_used}` : '';
  return apiRequest(`/recharge-codes/list${query}`);
}
