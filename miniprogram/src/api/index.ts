import { apiRequest } from './client';

// ==================== 认证 ====================

export function login(email: string, password: string) {
  return apiRequest<{ token: string; teacher: any }>('/auth/login', {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
  });
}

export function register(email: string, password: string, displayName?: string) {
  return apiRequest<{ token: string; teacher: any }>('/auth/register', {
    method: 'POST',
    body: { email, password, display_name: displayName || email.split('@')[0] },
    skipAuth: true,
  });
}

export function wechatMiniLogin(code: string) {
  return apiRequest<{ token: string; teacher: any; isNewUser: boolean }>('/auth/wechat/login-mini', {
    method: 'POST',
    body: { code },
    skipAuth: true,
  });
}

// ==================== 仪表盘 ====================

export function fetchDashboardStats() {
  return apiRequest<{ classes: number; students: number; pets_adopted: number; today_points: number; top10: any[]; recent_adoptions: any[] }>('/dashboard/stats');
}

// ==================== 班级 ====================

export function fetchClasses() {
  return apiRequest<{ data: any[] }>('/classes');
}

export function createClass(name: string, grade: string) {
  return apiRequest('/classes', { method: 'POST', body: { name, grade } });
}

export function updateClass(id: string, data: { name?: string; grade?: string; is_archived?: boolean }) {
  return apiRequest(`/classes/${id}`, { method: 'PATCH', body: data });
}

// ==================== 学生 ====================

export function fetchStudents(classId: string) {
  return apiRequest<{ data: any[] }>(`/students?class_id=${classId}`);
}

export function addStudent(classId: string, name: string) {
  return apiRequest('/students', { method: 'POST', body: { class_id: classId, name } });
}

export function updateStudentPoints(studentId: string, pointsChange: number, reason: string, category: string) {
  return apiRequest('/points', { method: 'POST', body: { student_id: studentId, points_change: pointsChange, reason, category } });
}

// ==================== 宠物 ====================

export function fetchPets() {
  return apiRequest<{ data: any[] }>('/pets');
}

export function fetchStudentPets(studentId: string) {
  return apiRequest<{ data: any[] }>(`/pets/student/${studentId}`);
}

export function adoptPet(data: { student_id: string; pet_id: string; nickname?: string }) {
  return apiRequest('/pets/adopt', { method: 'POST', body: data });
}

export function feedPet(studentPetId: string) {
  return apiRequest('/pets/feed', { method: 'POST', body: { student_pet_id: studentPetId } });
}

export function feedAllPets(studentId: string) {
  return apiRequest('/pets/feed-all', { method: 'POST', body: { student_id: studentId } });
}

// ==================== 排行榜 ====================

export function fetchRankings(type: 'students' | 'pets' | 'classes', classId?: string) {
  const params = classId ? `?class_id=${classId}` : '';
  return apiRequest<{ data: any[] }>(`/rankings/${type}${params}`);
}

// ==================== 家长 ====================

export function fetchParentChildren() {
  return apiRequest<{ data: any[] }>('/parent/children');
}

export function linkChild(code: string) {
  return apiRequest('/parent/link', { method: 'POST', body: { code } });
}

// ==================== 评价规则 ====================

export function fetchRules() {
  return apiRequest<{ data: any[] }>('/rules');
}

// ==================== 学期重置 ====================

export function resetPets() {
  return apiRequest('/admin/reset-pets', { method: 'POST' });
}
