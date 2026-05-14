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
