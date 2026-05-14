import { apiRequest } from './client';

export function fetchStudentRankings(classId?: string): Promise<{ data: any[] }> {
  const query = classId ? `?class_id=${classId}` : '';
  return apiRequest(`/rankings/students${query}`);
}

export function fetchPetRankings(): Promise<{ data: any[] }> {
  return apiRequest('/rankings/pets');
}

export function fetchClassRankings(): Promise<{ data: any[] }> {
  return apiRequest('/rankings/classes');
}
