CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES teachers(id),
  is_pinned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_announcements_pinned_date ON announcements(is_pinned, created_at);

CREATE TABLE IF NOT EXISTS bulletin_posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES teachers(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bulletin_posts_created ON bulletin_posts(created_at);

CREATE TABLE IF NOT EXISTS semester_rewards (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK(category IN ('students','pets','classes')),
  rank_start INTEGER NOT NULL,
  rank_end INTEGER NOT NULL,
  reward TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_semester_rewards_category ON semester_rewards(category);
