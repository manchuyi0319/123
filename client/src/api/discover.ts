import { apiRequest } from './client';

export function fetchPublicClasses(): Promise<{ data: any[] }> {
  return apiRequest('/discover/classes');
}

export function fetchPublicClassDetail(id: string): Promise<any> {
  return apiRequest(`/discover/classes/${id}`);
}
