import { apiRequest } from './client';

export function fetchAdminStats(): Promise<{ teacherCount: number; studentCount: number; classCount: number; petCount: number }> {
  return apiRequest('/admin/stats');
}

export function fetchTeachers(): Promise<{ data: any[] }> {
  return apiRequest('/admin/teachers');
}

export function deleteTeacher(id: string): Promise<{ success: boolean }> {
  return apiRequest(`/admin/teachers/${id}`, { method: 'DELETE' });
}
