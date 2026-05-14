import { apiRequest } from './client';

export function fetchRules(): Promise<{ data: any[] }> {
  return apiRequest('/rules');
}

export function createRule(data: { name: string; description?: string; points_value: number; category: string; icon?: string }): Promise<any> {
  return apiRequest('/rules', { method: 'POST', body: JSON.stringify(data) });
}

export function updateRule(id: string, data: any): Promise<any> {
  return apiRequest(`/rules/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteRule(id: string): Promise<{ success: boolean }> {
  return apiRequest(`/rules/${id}`, { method: 'DELETE' });
}
