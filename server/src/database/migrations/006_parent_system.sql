-- 班级邀请码（6位字母数字，老师分享给家长）
ALTER TABLE classes ADD COLUMN invite_code TEXT;

-- 家长-学生关联表（审批通过后建立，支持多位家长关联同一学生）
CREATE TABLE IF NOT EXISTS parent_students (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL REFERENCES teachers(id),
  student_id TEXT NOT NULL REFERENCES students(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(parent_id, student_id)
);

-- 家长加入申请表
CREATE TABLE IF NOT EXISTS join_requests (
  id TEXT PRIMARY KEY,
  parent_id TEXT NOT NULL REFERENCES teachers(id),
  student_id TEXT NOT NULL REFERENCES students(id),
  class_id TEXT NOT NULL REFERENCES classes(id),
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_join_requests_class_id ON join_requests(class_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON join_requests(status);
CREATE INDEX IF NOT EXISTS idx_parent_students_parent_id ON parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_student_id ON parent_students(student_id);
