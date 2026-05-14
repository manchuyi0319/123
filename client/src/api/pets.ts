import { apiRequest } from './client';

export function fetchPets(): Promise<{ data: any[] }> {
  return apiRequest('/pets');
}

export function adoptPet(data: { student_id: string; pet_id: string; nickname?: string }): Promise<any> {
  return apiRequest('/pets/adopt', { method: 'POST', body: JSON.stringify(data) });
}

export function feedPet(data: { student_pet_id: string }): Promise<any> {
  return apiRequest('/pets/feed', { method: 'POST', body: JSON.stringify(data) });
}

export function fetchStudentPets(studentId: string): Promise<{ data: any[] }> {
  return apiRequest(`/pets/student/${studentId}`);
}
