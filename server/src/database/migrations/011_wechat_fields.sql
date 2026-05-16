-- 微信绑定：支持网站/小程序双端统一账号
ALTER TABLE teachers ADD COLUMN unionid TEXT;
ALTER TABLE teachers ADD COLUMN wechat_nickname TEXT;
ALTER TABLE teachers ADD COLUMN login_type TEXT NOT NULL DEFAULT 'email';

CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_unionid ON teachers(unionid);
