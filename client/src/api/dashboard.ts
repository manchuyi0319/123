import { apiRequest } from './client';

export interface DashboardStats {
  classCount: number;
  studentCount: number;
  petCount: number;
  todayPoints: number;
}

export function fetchDashboardStats(scope?: string): Promise<DashboardStats> {
  const query = scope === 'all' ? '?scope=all' : '';
  return apiRequest<DashboardStats>(`/dashboard/stats${query}`);
}

export function fetchWeeklyTop5(scope?: string): Promise<{ data: any[] }> {
  const query = scope === 'all' ? '?scope=all' : '';
  return apiRequest(`/dashboard/weekly-top5${query}`);
}

export function fetchRecentPets(scope?: string): Promise<{ data: any[] }> {
  const query = scope === 'all' ? '?scope=all' : '';
  return apiRequest(`/dashboard/recent-pets${query}`);
}
