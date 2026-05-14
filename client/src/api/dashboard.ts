import { apiRequest } from './client';

export interface DashboardStats {
  classCount: number;
  studentCount: number;
  petCount: number;
  todayPoints: number;
}

export function fetchDashboardStats(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>('/dashboard/stats');
}

export function fetchWeeklyTop5(): Promise<{ data: any[] }> {
  return apiRequest('/dashboard/weekly-top5');
}

export function fetchRecentPets(): Promise<{ data: any[] }> {
  return apiRequest('/dashboard/recent-pets');
}
