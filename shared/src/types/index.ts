export interface Teacher {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  grade: string | null;
  description: string | null;
  is_archived: number;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  class_id: string;
  name: string;
  student_number: string | null;
  avatar_url: string | null;
  total_points: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  description: string | null;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  sort_order: number;
}

export interface StudentPet {
  id: string;
  student_id: string;
  pet_id: string;
  nickname: string | null;
  current_exp: number;
  is_active: number;
  hatched_at: string;
  last_fed_at: string | null;
  pet?: Pet;
  student?: Student;
}

export interface PointRecord {
  id: string;
  student_id: string;
  teacher_id: string;
  points_change: number;
  reason: string;
  category: 'behavior' | 'academic' | 'attendance' | 'custom' | 'feeding';
  evaluation_rule_id: string | null;
  created_at: string;
  student?: Student;
}

export interface EvaluationRule {
  id: string;
  teacher_id: string;
  name: string;
  description: string | null;
  points_value: number;
  category: 'behavior' | 'academic' | 'attendance' | 'custom';
  icon: string | null;
  is_preset: number;
  sort_order: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  display_name: string;
}

export interface AuthResponse {
  token: string;
  teacher: Teacher;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
