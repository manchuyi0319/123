import { Router, Response } from 'express';
import crypto from 'crypto';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { addPointsSchema } from '../validators/points.validator';
import { getDb } from '../database/connection';

const router = Router();
router.use(authMiddleware);

// 给学生加减分
router.post('/', validate(addPointsSchema), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { student_id, points_change, reason, category, evaluation_rule_id } = req.body;

  // 验证学生属于该教师的班级
  const student = db.get(
    `SELECT s.id, s.total_points, c.id as class_id, c.name as class_name
     FROM students s JOIN classes c ON s.class_id = c.id
     WHERE s.id = ? AND c.teacher_id = ? AND s.is_active = 1 AND c.is_archived = 0`,
    [student_id, req.teacherId]
  );
  if (!student) {
    res.status(404).json({ error: '学生不存在或无权操作' });
    return;
  }

  const id = crypto.randomUUID();
  const newPoints = (student as any).total_points + points_change;

  db.run(
    `INSERT INTO point_records (id, student_id, teacher_id, points_change, reason, category, evaluation_rule_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, student_id, req.teacherId, points_change, reason, category, evaluation_rule_id || null]
  );

  db.run('UPDATE students SET total_points = ?, updated_at = datetime(\'now\') WHERE id = ?', [newPoints, student_id]);

  const record = db.get('SELECT * FROM point_records WHERE id = ?', [id]);
  res.status(201).json({ ...record, total_points: newPoints });
});

// 获取积分记录（支持按学生/班级/时间筛选）
router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { student_id, class_id, limit: limitStr, offset: offsetStr } = req.query;
  const limit = Math.min(parseInt(limitStr as string) || 50, 200);
  const offset = parseInt(offsetStr as string) || 0;

  let where = 'pr.teacher_id = ?';
  const params: any[] = [req.teacherId];

  if (student_id) {
    where += ' AND pr.student_id = ?';
    params.push(student_id);
  }
  if (class_id) {
    where += ' AND s.class_id = ?';
    params.push(class_id);
  }

  const rows = db.all(
    `SELECT pr.*, s.name as student_name, s.class_id, c.name as class_name
     FROM point_records pr
     JOIN students s ON pr.student_id = s.id
     JOIN classes c ON s.class_id = c.id
     WHERE ${where}
     ORDER BY pr.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const total = db.get(
    `SELECT COUNT(*) as count FROM point_records pr
     JOIN students s ON pr.student_id = s.id
     WHERE ${where}`,
    params
  );

  res.json({ data: rows, total: (total as any).count, limit, offset });
});

// 获取单个学生的积分流水
router.get('/student/:studentId', (req: AuthRequest, res: Response) => {
  const db = getDb();

  const student = db.get(
    `SELECT s.id FROM students s JOIN classes c ON s.class_id = c.id
     WHERE s.id = ? AND c.teacher_id = ?`,
    [req.params.studentId, req.teacherId]
  );
  if (!student) {
    res.status(404).json({ error: '学生不存在或无权操作' });
    return;
  }

  const records = db.all(
    `SELECT pr.*, t.display_name as teacher_name
     FROM point_records pr
     LEFT JOIN teachers t ON pr.teacher_id = t.id
     WHERE pr.student_id = ?
     ORDER BY pr.created_at DESC LIMIT 50`,
    [req.params.studentId]
  );

  res.json({ data: records });
});

export default router;
