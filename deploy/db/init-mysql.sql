-- ============================================================
-- MySQL 建表语句（备用迁移方案）
-- 当前生产环境使用 SQLite，此文件为未来迁移 MySQL 做准备
-- 使用：mysql -u root -p class_pet_garden < init-mysql.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS class_pet_garden
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE class_pet_garden;

-- 用户表（教师 + 家长，通过 role 区分）
CREATE TABLE IF NOT EXISTS teachers (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL COMMENT '登录邮箱',
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  email VARCHAR(255) COMMENT '联系邮箱（可与登录邮箱不同）',
  phone VARCHAR(20),
  bio TEXT,
  school VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'teacher' COMMENT 'admin/teacher/parent',
  coins INT NOT NULL DEFAULT 0 COMMENT '金币余额',
  unionid VARCHAR(64) COMMENT '微信 UnionID',
  wechat_nickname VARCHAR(100) COMMENT '微信昵称',
  login_type VARCHAR(20) NOT NULL DEFAULT 'email' COMMENT 'email/wechat/both',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_teachers_unionid (unionid),
  INDEX idx_teachers_role (role)
) ENGINE=InnoDB;

-- 班级表
CREATE TABLE IF NOT EXISTS classes (
  id VARCHAR(36) PRIMARY KEY,
  teacher_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  grade VARCHAR(50),
  description TEXT,
  invite_code VARCHAR(10),
  is_archived TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  INDEX idx_classes_teacher_id (teacher_id),
  INDEX idx_classes_invite_code (invite_code)
) ENGINE=InnoDB;

-- 学生表
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(36) PRIMARY KEY,
  class_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  student_number VARCHAR(50),
  avatar_url TEXT,
  total_points INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  INDEX idx_students_class_id (class_id)
) ENGINE=InnoDB;

-- 宠物表
CREATE TABLE IF NOT EXISTS pets (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  species VARCHAR(50) NOT NULL,
  description TEXT,
  emoji VARCHAR(10) NOT NULL,
  rarity VARCHAR(20) NOT NULL DEFAULT 'common',
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 学生宠物关联表
CREATE TABLE IF NOT EXISTS student_pets (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  pet_id VARCHAR(36) NOT NULL,
  nickname VARCHAR(100),
  current_exp INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  hatched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_fed_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  UNIQUE KEY uk_student_pet (student_id, pet_id),
  INDEX idx_student_pets_student_id (student_id)
) ENGINE=InnoDB;

-- 积分记录表
CREATE TABLE IF NOT EXISTS point_records (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  teacher_id VARCHAR(36) NOT NULL,
  points_change INT NOT NULL,
  reason TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'custom',
  evaluation_rule_id VARCHAR(36),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  INDEX idx_point_records_student_id (student_id),
  INDEX idx_point_records_created_at (created_at)
) ENGINE=InnoDB;

-- 评价规则表
CREATE TABLE IF NOT EXISTS evaluation_rules (
  id VARCHAR(36) PRIMARY KEY,
  teacher_id VARCHAR(36),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  points_value INT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'custom',
  icon VARCHAR(10),
  is_preset TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
  INDEX idx_evaluation_rules_teacher_id (teacher_id)
) ENGINE=InnoDB;

-- 迁移记录表
CREATE TABLE IF NOT EXISTS _migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
