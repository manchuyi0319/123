import { apiRequest } from './client';
import type { Student, JoinRequest } from 'shared';

export interface ParentRegisterResponse {
  token: string;
  teacher: any;
  invited_class: any;
}

export function parentRegister(data: { email: string; password: string; display_name: string; invite_code: string }) {
  return apiRequest<ParentRegisterResponse>('/parent/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fetchChildren() {
  return apiRequest<{ data: any[] }>('/parent/children');
}

export function fetchChildDetail(id: string) {
  return apiRequest<any>(`/parent/children/${id}`);
}

export function fetchClassStudents(inviteCode: string) {
  return apiRequest<{ data: any[]; class: any }>(`/parent/class-students/${inviteCode}`);
}

export function submitJoinRequest(data: { student_id: string; message?: string }) {
  return apiRequest<JoinRequest>('/parent/join-request', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fetchMyJoinRequests() {
  return apiRequest<{ data: JoinRequest[] }>('/parent/join-requests');
}
