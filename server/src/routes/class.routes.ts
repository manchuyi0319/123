import { Router, Response } from 'express';
import crypto from 'crypto';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createClassSchema, updateClassSchema } from '../validators/class.validator';
import { getDb } from '../database/connection';

const router = Router();
router.use(authMiddleware);

// 创建班级
router.post('/', validate(createClassSchema), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { name, grade, school, description } = req.body;
  const id = crypto.randomUUID();

  db.run(
    'INSERT INTO classes (id, teacher_id, name, grade, school, description) VALUES (?, ?, ?, ?, ?, ?)',
    [id, req.teacherId, name, grade || null, school || null, description || null]
  );

  const class_ = db.get('SELECT * FROM classes WHERE id = ?', [id]);
  res.status(201).json(class_);
});

// 获取班级列表
router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const classes = db.all(
    'SELECT c.*, (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id AND s.is_active = 1) as student_count FROM classes c WHERE c.teacher_id = ? AND c.is_archived = 0 ORDER BY c.created_at DESC',
    [req.teacherId]
  );
  res.json({ data: classes });
});

// 获取单个班级详情（含学生列表）
router.get('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const class_ = db.get(
    'SELECT * FROM classes WHERE id = ? AND teacher_id = ?',
    [req.params.id, req.teacherId]
  );
  if (!class_) {
    res.status(404).json({ error: '班级不存在' });
    return;
  }

  const students = db.all(
    'SELECT * FROM students WHERE class_id = ? AND is_active = 1 ORDER BY created_at DESC',
    [req.params.id]
  );
  res.json({ ...class_, students });
});

// 更新班级
router.patch('/:id', validate(updateClassSchema), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const class_ = db.get(
    'SELECT * FROM classes WHERE id = ? AND teacher_id = ?',
    [req.params.id, req.teacherId]
  );
  if (!class_) {
    res.status(404).json({ error: '班级不存在' });
    return;
  }

  const updates: string[] = [];
  const params: any[] = [];

  for (const key of ['name', 'grade', 'school', 'description']) {
    if (req.body[key] !== undefined) {
      updates.push(`${key} = ?`);
      params.push(req.body[key]);
    }
  }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);
    db.run(`UPDATE classes SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  const updated = db.get('SELECT * FROM classes WHERE id = ?', [req.params.id]);
  res.json(updated);
});

// 生成/刷新班级邀请码
router.post('/:id/invite-code', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const class_ = db.get(
    'SELECT * FROM classes WHERE id = ? AND teacher_id = ?',
    [req.params.id, req.teacherId]
  );
  if (!class_) {
    res.status(404).json({ error: '班级不存在' });
    return;
  }

  // 生成6位随机大写字母数字邀请码
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  db.run(
    "UPDATE classes SET invite_code = ?, updated_at = datetime('now') WHERE id = ?",
    [code, req.params.id]
  );

  res.json({ invite_code: code });
});

// 归档班级（软删除）
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const class_ = db.get(
    'SELECT * FROM classes WHERE id = ? AND teacher_id = ?',
    [req.params.id, req.teacherId]
  );
  if (!class_) {
    res.status(404).json({ error: '班级不存在' });
    return;
  }

  db.run("UPDATE classes SET is_archived = 1, updated_at = datetime('now') WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

// 班级升学（升年级）
router.post('/:id/promote', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const class_ = db.get(
    'SELECT * FROM classes WHERE id = ? AND teacher_id = ?',
    [req.params.id, req.teacherId]
  ) as any;

  if (!class_) {
    res.status(404).json({ error: '班级不存在' });
    return;
  }

  const { new_grade } = req.body;
  if (!new_grade || typeof new_grade !== 'string' || !new_grade.trim()) {
    res.status(400).json({ error: '请输入新年级' });
    return;
  }

  const fromGrade = class_.grade || '未知';

  db.run(
    "UPDATE classes SET grade = ?, updated_at = datetime('now') WHERE id = ?",
    [new_grade.trim(), req.params.id]
  );

  // 记录升学历史
  const id = crypto.randomUUID();
  db.run(
    'INSERT INTO class_promotions (id, class_id, teacher_id, from_grade, to_grade) VALUES (?, ?, ?, ?, ?)',
    [id, req.params.id, req.teacherId, fromGrade, new_grade.trim()]
  );

  const updated = db.get('SELECT * FROM classes WHERE id = ?', [req.params.id]);
  res.json({ ...updated, promoted_from: fromGrade, promoted_to: new_grade.trim() });
});

export default router;
