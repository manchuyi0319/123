-- 学生竞赛闯关等级
ALTER TABLE students ADD COLUMN quiz_level INTEGER NOT NULL DEFAULT 1;

-- 竞赛题库
CREATE TABLE IF NOT EXISTS quiz_questions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  options TEXT NOT NULL,
  answer INTEGER NOT NULL,
  explanation TEXT,
  grade INTEGER NOT NULL,
  subject TEXT NOT NULL DEFAULT 'fun',
  difficulty INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 答题记录
CREATE TABLE IF NOT EXISTS quiz_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id),
  teacher_id TEXT NOT NULL REFERENCES teachers(id),
  question_id TEXT NOT NULL REFERENCES quiz_questions(id),
  selected_answer INTEGER NOT NULL,
  is_correct INTEGER NOT NULL,
  level INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 每日答题统计
CREATE TABLE IF NOT EXISTS quiz_daily_stats (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id),
  date TEXT NOT NULL,
  questions_answered INTEGER NOT NULL DEFAULT 0,
  questions_correct INTEGER NOT NULL DEFAULT 0,
  questions_wrong INTEGER NOT NULL DEFAULT 0,
  levels_gained INTEGER NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE(student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_grade ON quiz_questions(grade);
CREATE INDEX IF NOT EXISTS idx_quiz_records_student ON quiz_records(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_daily_stats_student_date ON quiz_daily_stats(student_id, date);
