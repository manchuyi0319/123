import { apiRequest } from './client';
import type { Class } from 'shared';

export function fetchClasses(): Promise<{ data: (Class & { student_count: number })[] }> {
  return apiRequest('/classes');
}

export function fetchClassDetail(id: string): Promise<Class & { students: any[] }> {
  return apiRequest(`/classes/${id}`);
}

export function createClass(data: { name: string; grade?: string; description?: string }): Promise<Class> {
  return apiRequest('/classes', { method: 'POST', body: JSON.stringify(data) });
}

export function updateClass(id: string, data: { name?: string; grade?: string; description?: string }): Promise<Class> {
  return apiRequest(`/classes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function archiveClass(id: string): Promise<{ success: boolean }> {
  return apiRequest(`/classes/${id}`, { method: 'DELETE' });
}
