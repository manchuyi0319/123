-- 将所有旧管理员降级为普通教师（保留永久管理员）
UPDATE teachers SET role = 'teacher' WHERE role = 'admin' AND username != '505694933@qq.com';
-- 确保永久管理员账号正确设置
UPDATE teachers SET role = 'admin' WHERE username = '505694933@qq.com';
