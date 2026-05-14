import { apiRequest } from './client';

export function fetchStudentRankings(classId?: string, scope?: string): Promise<{ data: any[] }> {
  const params = new URLSearchParams();
  if (classId) params.set('class_id', classId);
  if (scope === 'all') params.set('scope', 'all');
  const query = params.toString();
  return apiRequest(`/rankings/students${query ? '?' + query : ''}`);
}

export function fetchPetRankings(scope?: string): Promise<{ data: any[] }> {
  const query = scope === 'all' ? '?scope=all' : '';
  return apiRequest(`/rankings/pets${query}`);
}

export function fetchClassRankings(scope?: string): Promise<{ data: any[] }> {
  const query = scope === 'all' ? '?scope=all' : '';
  return apiRequest(`/rankings/classes${query}`);
}
