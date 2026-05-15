-- 班级升学记录
CREATE TABLE IF NOT EXISTS class_promotions (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES classes(id),
  teacher_id TEXT NOT NULL REFERENCES teachers(id),
  from_grade TEXT NOT NULL,
  to_grade TEXT NOT NULL,
  promoted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_class_promotions_class ON class_promotions(class_id);
