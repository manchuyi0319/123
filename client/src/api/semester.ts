import { apiRequest } from './client';
import type { SemesterReward } from 'shared';

export function fetchSemesterRewards(): Promise<{ data: SemesterReward[] }> {
  return apiRequest('/semester/rewards');
}

export function updateSemesterRewards(rewards: Omit<SemesterReward, 'created_at' | 'updated_at'>[]): Promise<{ data: SemesterReward[] }> {
  return apiRequest('/semester/rewards', {
    method: 'PUT',
    body: JSON.stringify({ rewards }),
  });
}

export function fetchSemesterStudentRankings(): Promise<{ data: any[] }> {
  return apiRequest('/semester/rankings/students');
}

export function fetchSemesterPetRankings(): Promise<{ data: any[] }> {
  return apiRequest('/semester/rankings/pets');
}

export function fetchSemesterClassRankings(): Promise<{ data: any[] }> {
  return apiRequest('/semester/rankings/classes');
}
