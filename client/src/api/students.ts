import { apiRequest } from './client';
import type { Student } from 'shared';

export function fetchStudents(classId?: string): Promise<{ data: (Student & { class_name?: string })[] }> {
  const query = classId ? `?class_id=${classId}` : '';
  return apiRequest(`/students${query}`);
}

export function fetchStudentDetail(id: string): Promise<any> {
  return apiRequest(`/students/${id}`);
}

export function addStudent(data: { class_id: string; name: string; student_number?: string }): Promise<Student> {
  return apiRequest('/students', { method: 'POST', body: JSON.stringify(data) });
}

export function batchAddStudents(data: { class_id: string; names: string[] }): Promise<{ data: Student[]; total: number }> {
  return apiRequest('/students/batch', { method: 'POST', body: JSON.stringify(data) });
}

export function updateStudent(id: string, data: { name?: string; student_number?: string }): Promise<Student> {
  return apiRequest(`/students/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deactivateStudent(id: string): Promise<{ success: boolean }> {
  return apiRequest(`/students/${id}`, { method: 'DELETE' });
}
