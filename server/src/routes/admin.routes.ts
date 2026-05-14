import { Router, Response } from 'express';
import crypto from 'crypto';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { teacherRepo } from '../repositories/teacher.repo';
import { getDb } from '../database/connection';

const router = Router();
router.use(authMiddleware);

// ===== 普通教师可访问的工具接口 =====

// 导出数据（CSV）
router.post('/export', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const teacherId = req.teacherId!;

  const classes = db.all(
    `SELECT c.id, c.name AS class_name, c.grade, c.school,
            COUNT(s.id) AS student_count,
            COALESCE(ROUND(AVG(s.total_points), 1), 0) AS avg_points
     FROM classes c
     LEFT JOIN students s ON s.class_id = c.id AND s.is_active = 1
     WHERE c.teacher_id = ? AND c.is_archived = 0
     GROUP BY c.id
     ORDER BY c.name`,
    [teacherId]
  ) as any[];

  const students = db.all(
    `SELECT s.name AS student_name, c.name AS class_name, s.total_points
     FROM students s JOIN classes c ON s.class_id = c.id
     WHERE c.teacher_id = ? AND s.is_active = 1 AND c.is_archived = 0
     ORDER BY c.name, s.total_points DESC`,
    [teacherId]
  ) as any[];

  // 生成 CSV
  let csv = '﻿班级,年级,学校,学生数,平均分\n';
  for (const c of classes) {
    csv += `${c.class_name},${c.grade || ''},${c.school || ''},${c.student_count},${c.avg_points}\n`;
  }
  csv += '\n学生姓名,班级,积分\n';
  for (const s of students) {
    csv += `${s.student_name},${s.class_name},${s.total_points}\n`;
  }

  res.json({ csv });
});

// 成绩报告
router.get('/report', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const teacherId = req.teacherId!;

  const classes = db.all(
    `SELECT c.name AS class_name,
            COUNT(s.id) AS student_count,
            COALESCE(ROUND(AVG(s.total_points), 1), 0) AS avg_points,
            COALESCE(MAX(s.total_points), 0) AS max_points,
            COALESCE(SUM(s.total_points), 0) AS total_points
     FROM classes c
     LEFT JOIN students s ON s.class_id = c.id AND s.is_active = 1
     WHERE c.teacher_id = ? AND c.is_archived = 0
     GROUP BY c.id
     ORDER BY avg_points DESC`,
    [teacherId]
  );

  res.json({ classes });
});

// 重置积分
router.post('/reset-points', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const teacherId = req.teacherId!;
  const { class_id } = req.body;

  // 验证班级归属
  const cls = db.get(
    'SELECT id FROM classes WHERE id = ? AND teacher_id = ? AND is_archived = 0',
    [class_id, teacherId]
  );
  if (!cls) { res.status(404).json({ error: '班级不存在或无权操作' }); return; }

  db.run('UPDATE students SET total_points = 0 WHERE class_id = ? AND is_active = 1', [class_id]);
  db.run(
    "INSERT INTO point_records (id, student_id, teacher_id, points_change, reason, category) SELECT ?, s.id, ?, 0, '积分重置（清零）', 'reset' FROM students s WHERE s.class_id = ? AND s.is_active = 1",
    [crypto.randomUUID(), teacherId, class_id]
  );

  res.json({ success: true });
});

// ===== 以下为管理员专属接口 =====
router.use(adminMiddleware);

// 平台总览统计
router.get('/stats', (_req: AuthRequest, res: Response) => {
  const db = getDb();

  const teacherCount = db.get("SELECT COUNT(*) as count FROM teachers WHERE username != '505694933@qq.com'") as any;
  const studentCount = db.get('SELECT COUNT(*) as count FROM students WHERE is_active = 1') as any;
  const classCount = db.get('SELECT COUNT(*) as count FROM classes WHERE is_archived = 0') as any;
  const petCount = db.get(
    `SELECT COUNT(*) as count FROM student_pets sp
     JOIN students s ON sp.student_id = s.id
     WHERE sp.is_active = 1 AND s.is_active = 1`
  ) as any;

  res.json({
    teacherCount: teacherCount.count,
    studentCount: studentCount.count,
    classCount: classCount.count,
    petCount: petCount.count,
  });
});

// 所有教师列表
router.get('/teachers', (_req: AuthRequest, res: Response) => {
  const teachers = teacherRepo.findAll();
  res.json({ data: teachers });
});

// 删除教师及其所有关联数据
router.delete('/teachers/:id', (req: AuthRequest, res: Response) => {
  const teacher = teacherRepo.findById(req.params.id);
  if (!teacher) {
    res.status(404).json({ error: '教师不存在' });
    return;
  }

  if (teacher.role === 'admin') {
    res.status(400).json({ error: '不能删除管理员账号' });
    return;
  }

  // 保护永久管理员（即使角色被意外修改也不能删除）
  const fullTeacher = teacherRepo.findByIdWithPassword(req.params.id);
  if (fullTeacher && (fullTeacher as any).username === '505694933@qq.com') {
    res.status(400).json({ error: '不能删除永久管理员账号' });
    return;
  }

  teacherRepo.deleteById(req.params.id);
  res.json({ success: true });
});

export default router;
