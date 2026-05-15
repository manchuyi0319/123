import { apiRequest } from './client';

export interface QuizStatus {
  quiz_level: number;
  today_wrong: number;
  max_daily_wrong: number;
  remaining: number;
  questions_answered_today: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  grade: number;
  subject: string;
  quiz_level: number;
  remaining: number;
}

export interface QuizAnswerResult {
  correct: boolean;
  correct_answer: number;
  explanation: string;
  selected_answer: number;
  new_level: number;
  points_earned: number;
  remaining: number;
  quiz_level: number;
}

export function fetchQuizStatus(studentId: string): Promise<QuizStatus> {
  return apiRequest(`/quiz/status?student_id=${encodeURIComponent(studentId)}`);
}

export function fetchQuizQuestion(studentId: string): Promise<QuizQuestion> {
  return apiRequest(`/quiz/question?student_id=${encodeURIComponent(studentId)}`);
}

export function submitQuizAnswer(
  studentId: string,
  questionId: string,
  selectedAnswer: number
): Promise<QuizAnswerResult> {
  return apiRequest('/quiz/answer', {
    method: 'POST',
    body: JSON.stringify({ student_id: studentId, question_id: questionId, selected_answer: selectedAnswer }),
  });
}
