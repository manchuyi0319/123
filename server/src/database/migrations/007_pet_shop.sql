-- 宠物价格（金币）、图片URL
ALTER TABLE pets ADD COLUMN price INTEGER NOT NULL DEFAULT 0;
ALTER TABLE pets ADD COLUMN image_url TEXT;

-- 用户金币余额
ALTER TABLE teachers ADD COLUMN coins INTEGER NOT NULL DEFAULT 0;

-- 支付订单
CREATE TABLE IF NOT EXISTS payment_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES teachers(id),
  amount INTEGER NOT NULL,
  coins INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 充值码（管理员生成，用户兑换）
CREATE TABLE IF NOT EXISTS recharge_codes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  coins INTEGER NOT NULL,
  created_by TEXT NOT NULL REFERENCES teachers(id),
  used_by TEXT REFERENCES teachers(id),
  is_used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  used_at TEXT
);

-- 金币流水记录
CREATE TABLE IF NOT EXISTS coin_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES teachers(id),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  related_order_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_recharge_codes_code ON recharge_codes(code);
CREATE INDEX IF NOT EXISTS idx_coin_records_user ON coin_records(user_id);
