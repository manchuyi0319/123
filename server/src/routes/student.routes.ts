import { Router, Response } from 'express';
import crypto from 'crypto';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createStudentSchema, updateStudentSchema, batchCreateSchema } from '../validators/student.validator';
import { getDb } from '../database/connection';

const router = Router();
router.use(authMiddleware);

// 验证班级属于当前教师
function verifyClassOwnership(classId: string, teacherId: string): boolean {
  const c = getDb().get(
    'SELECT id FROM classes WHERE id = ? AND teacher_id = ? AND is_archived = 0',
    [classId, teacherId]
  );
  return !!c;
}

// 添加学生
router.post('/', validate(createStudentSchema), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { class_id, name, student_number, avatar_url } = req.body;

  if (!verifyClassOwnership(class_id, req.teacherId!)) {
    res.status(404).json({ error: '班级不存在或无权操作' });
    return;
  }

  const id = crypto.randomUUID();
  db.run(
    'INSERT INTO students (id, class_id, name, student_number, avatar_url) VALUES (?, ?, ?, ?, ?)',
    [id, class_id, name, student_number || null, avatar_url || null]
  );

  const student = db.get('SELECT * FROM students WHERE id = ?', [id]);
  res.status(201).json(student);
});

// 批量导入学生
router.post('/batch', validate(batchCreateSchema), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { class_id, names } = req.body;

  if (!verifyClassOwnership(class_id, req.teacherId!)) {
    res.status(404).json({ error: '班级不存在或无权操作' });
    return;
  }

  const created: any[] = [];
  for (const name of names) {
    const id = crypto.randomUUID();
    db.run('INSERT INTO students (id, class_id, name) VALUES (?, ?, ?)', [id, class_id, name]);
    const student = db.get('SELECT * FROM students WHERE id = ?', [id]);
    created.push(student);
  }

  res.status(201).json({ data: created, total: created.length });
});

// 获取学生列表（可按班级筛选）
router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { class_id } = req.query;

  if (class_id) {
    if (!verifyClassOwnership(class_id as string, req.teacherId!)) {
      res.status(404).json({ error: '班级不存在或无权操作' });
      return;
    }
    const students = db.all(
      'SELECT * FROM students WHERE class_id = ? AND is_active = 1 ORDER BY student_number, created_at',
      [class_id]
    );
    res.json({ data: students });
  } else {
    const students = db.all(
      `SELECT s.*, c.name as class_name FROM students s
       JOIN classes c ON s.class_id = c.id
       WHERE c.teacher_id = ? AND s.is_active = 1 AND c.is_archived = 0
       ORDER BY s.created_at DESC`,
      [req.teacherId]
    );
    res.json({ data: students });
  }
});

// 获取单个学生详情
router.get('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const student = db.get(
    `SELECT s.*, c.name as class_name, c.teacher_id
     FROM students s JOIN classes c ON s.class_id = c.id
     WHERE s.id = ? AND c.teacher_id = ?`,
    [req.params.id, req.teacherId]
  );

  if (!student) {
    res.status(404).json({ error: '学生不存在' });
    return;
  }

  const pets = db.all(
    `SELECT sp.*, p.name as pet_name, p.species, p.emoji, p.rarity
     FROM student_pets sp JOIN pets p ON sp.pet_id = p.id
     WHERE sp.student_id = ?`,
    [req.params.id]
  );

  const points = db.all(
    'SELECT * FROM point_records WHERE student_id = ? ORDER BY created_at DESC LIMIT 20',
    [req.params.id]
  );

  res.json({ ...student, pets, recent_points: points });
});

// 更新学生
router.patch('/:id', validate(updateStudentSchema), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const student = db.get(
    `SELECT s.id, c.teacher_id FROM students s
     JOIN classes c ON s.class_id = c.id WHERE s.id = ?`,
    [req.params.id]
  );

  if (!student || (student as any).teacher_id !== req.teacherId) {
    res.status(404).json({ error: '学生不存在' });
    return;
  }

  const updates: string[] = [];
  const params: any[] = [];

  for (const key of ['name', 'student_number', 'avatar_url']) {
    if (req.body[key] !== undefined) {
      updates.push(`${key} = ?`);
      params.push(req.body[key]);
    }
  }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);
    db.run(`UPDATE students SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  const updated = db.get('SELECT * FROM students WHERE id = ?', [req.params.id]);
  res.json(updated);
});

// 停用学生（软删除）
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const student = db.get(
    `SELECT s.id, c.teacher_id FROM students s
     JOIN classes c ON s.class_id = c.id WHERE s.id = ?`,
    [req.params.id]
  );

  if (!student || (student as any).teacher_id !== req.teacherId) {
    res.status(404).json({ error: '学生不存在' });
    return;
  }

  db.run("UPDATE students SET is_active = 0, updated_at = datetime('now') WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

export default router;
