import { apiRequest } from './client';
import type { Class } from 'shared';

export function fetchClasses(): Promise<{ data: (Class & { student_count: number })[] }> {
  return apiRequest('/classes');
}

export function fetchClassDetail(id: string): Promise<Class & { students: any[] }> {
  return apiRequest(`/classes/${id}`);
}

export function createClass(data: { name: string; grade?: string; school?: string; description?: string }): Promise<Class> {
  return apiRequest('/classes', { method: 'POST', body: JSON.stringify(data) });
}

export function updateClass(id: string, data: { name?: string; grade?: string; school?: string; description?: string }): Promise<Class> {
  return apiRequest(`/classes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function archiveClass(id: string): Promise<{ success: boolean }> {
  return apiRequest(`/classes/${id}`, { method: 'DELETE' });
}

export function generateInviteCode(id: string): Promise<{ invite_code: string }> {
  return apiRequest(`/classes/${id}/invite-code`, { method: 'POST' });
}
