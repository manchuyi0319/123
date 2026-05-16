export interface Teacher {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  school: string | null;
  role: 'admin' | 'teacher' | 'parent';
  coins: number;
  unionid?: string | null;
  wechat_nickname?: string | null;
  login_type?: 'email' | 'wechat' | 'both';
  created_at: string;
}

export interface JoinRequest {
  id: string;
  parent_id: string;
  student_id: string;
  class_id: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string | null;
  created_at: string;
  updated_at: string;
  parent_name?: string;
  student_name?: string;
  class_name?: string;
}

export interface ParentStudent {
  id: string;
  parent_id: string;
  student_id: string;
  created_at: string;
  student?: Student;
}

export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  grade: string | null;
  school: string | null;
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
  price: number;
  image_url: string | null;
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

export interface PaymentOrder {
  id: string;
  user_id: string;
  amount: number;
  coins: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

export interface RechargeCode {
  id: string;
  code: string;
  coins: number;
  created_by: string;
  used_by: string | null;
  is_used: number;
  created_at: string;
  used_at: string | null;
}

export interface CoinRecord {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  related_order_id: string | null;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string;
  answer: number;
  explanation: string | null;
  grade: number;
  subject: 'math' | 'chinese' | 'science' | 'fun' | 'riddle';
  difficulty: number;
}

export interface QuizRecord {
  id: string;
  student_id: string;
  teacher_id: string;
  question_id: string;
  selected_answer: number;
  is_correct: number;
  level: number;
  created_at: string;
}

export interface QuizDailyStats {
  id: string;
  student_id: string;
  date: string;
  questions_answered: number;
  questions_correct: number;
  questions_wrong: number;
  levels_gained: number;
  points_earned: number;
}

export interface QuizStatus {
  quiz_level: number;
  today_wrong: number;
  max_daily_wrong: number;
  remaining: number;
  questions_answered_today: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
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

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  is_pinned: number;
  author_name?: string;
  created_at: string;
  updated_at: string;
}

export interface BulletinPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  author_name?: string;
  author_avatar?: string | null;
  author_role?: string;
  created_at: string;
  updated_at: string;
}

export interface SemesterReward {
  id: string;
  category: 'students' | 'pets' | 'classes';
  rank_start: number;
  rank_end: number;
  reward: string;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
