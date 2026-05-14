import { apiRequest } from './client';

export function addPoints(data: { student_id: string; points_change: number; reason: string; category: string; evaluation_rule_id?: string }): Promise<any> {
  return apiRequest('/points', { method: 'POST', body: JSON.stringify(data) });
}

export function fetchStudentPoints(studentId: string): Promise<{ data: any[] }> {
  return apiRequest(`/points/student/${studentId}`);
}

export function fetchPointRecords(params?: { student_id?: string; class_id?: string; limit?: number }): Promise<{ data: any[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.student_id) query.set('student_id', params.student_id);
  if (params?.class_id) query.set('class_id', params.class_id);
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiRequest(`/points${qs ? `?${qs}` : ''}`);
}
