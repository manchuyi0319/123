import { apiRequest } from './client';
import type { JoinRequest } from 'shared';

export function fetchJoinRequests(params?: { class_id?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params?.class_id) query.set('class_id', params.class_id);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return apiRequest<{ data: JoinRequest[] }>(`/join-requests${qs ? `?${qs}` : ''}`);
}

export function approveJoinRequest(id: string) {
  return apiRequest<JoinRequest>(`/join-requests/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ status: 'approved' }),
  });
}

export function rejectJoinRequest(id: string) {
  return apiRequest<JoinRequest>(`/join-requests/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ status: 'rejected' }),
  });
}

export function fetchStudentJoinRequests(studentId: string) {
  return apiRequest<{ data: JoinRequest[] }>(`/join-requests/student/${studentId}`);
}
