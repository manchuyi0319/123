-- 宠物状态系统迁移
-- 添加 status 字段到 student_pets 表
-- alive: 正常 | injured: 受伤 | dead: 阵亡

ALTER TABLE student_pets ADD COLUMN status TEXT NOT NULL DEFAULT 'alive';

-- 创建索引加速状态查询
CREATE INDEX IF NOT EXISTS idx_student_pets_status ON student_pets(status);
