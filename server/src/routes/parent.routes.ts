import { Router, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { parentRegisterSchema, joinRequestSchema } from '../validators/parent.validator';
import { getDb } from '../database/connection';
import { signToken } from '../utils/jwt';
import { ValidationError, ConflictError, NotFoundError } from '../utils/errors';

const router = Router();

// 家长注册（需要邀请码）
router.post('/register', validate(parentRegisterSchema), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { email, password, display_name, invite_code } = req.body;

  // 验证邀请码
  const cls = db.get(
    'SELECT id, name, teacher_id, grade FROM classes WHERE invite_code = ? AND is_archived = 0',
    [invite_code.trim().toUpperCase()]
  );
  if (!cls) {
    res.status(400).json({ error: '邀请码无效，请联系老师获取正确的邀请码' });
    return;
  }

  // 检查邮箱是否已注册
  const existing = db.get('SELECT id FROM teachers WHERE username = ?', [email]);
  if (existing) {
    res.status(409).json({ error: '该邮箱已注册' });
    return;
  }

  if (password.length < 4) {
    res.status(400).json({ error: '密码长度不能少于4位' });
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  const id = crypto.randomUUID();

  db.run(
    'INSERT INTO teachers (id, username, password_hash, display_name, role) VALUES (?, ?, ?, ?, ?)',
    [id, email, passwordHash, display_name, 'parent']
  );

  const teacher = db.get(
    'SELECT id, username, display_name, avatar_url, email, phone, bio, school, role, created_at FROM teachers WHERE id = ?',
    [id]
  );

  const token = signToken(id, 'parent');
  res.status(201).json({ token, teacher, invited_class: cls });
});

// 获取家长关联的孩子列表
router.get('/children', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDb();
  if (req.teacherRole !== 'parent') {
    res.status(403).json({ error: '仅家长可访问' });
    return;
  }

  const children = db.all(
    `SELECT s.*, c.name as class_name, c.grade, c.invite_code,
            ps.id as link_id
     FROM parent_students ps
     JOIN students s ON ps.student_id = s.id
     JOIN classes c ON s.class_id = c.id
     WHERE ps.parent_id = ? AND s.is_active = 1 AND c.is_archived = 0
     ORDER BY ps.created_at DESC`,
    [req.teacherId]
  );

  // 对每个孩子获取宠物数量
  const result = children.map((child: any) => {
    const petCount = (db.get(
      'SELECT COUNT(*) as count FROM student_pets WHERE student_id = ?',
      [child.id]
    ) as any).count;
    return { ...child, pet_count: petCount };
  });

  res.json({ data: result });
});

// 获取单个孩子详情
router.get('/children/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDb();

  // 验证该家长有权查看此学生
  const link = db.get(
    'SELECT * FROM parent_students WHERE parent_id = ? AND student_id = ?',
    [req.teacherId, req.params.id]
  );
  if (!link) {
    res.status(404).json({ error: '未找到该学生关联' });
    return;
  }

  const student = db.get(
    `SELECT s.*, c.name as class_name, c.grade, c.teacher_id
     FROM students s JOIN classes c ON s.class_id = c.id
     WHERE s.id = ?`,
    [req.params.id]
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

  const recentPoints = db.all(
    'SELECT * FROM point_records WHERE student_id = ? ORDER BY created_at DESC LIMIT 20',
    [req.params.id]
  );

  // 计算排名
  const allStudents = db.all(
    'SELECT id, total_points FROM students WHERE class_id = ? AND is_active = 1 ORDER BY total_points DESC',
    [(student as any).class_id]
  );
  const rank = allStudents.findIndex((s: any) => s.id === (student as any).id) + 1;

  res.json({ ...student, pets, recent_points: recentPoints, rank, total_in_class: allStudents.length });
});

// 家长提交加入申请
router.post('/join-request', authMiddleware, validate(joinRequestSchema), (req: AuthRequest, res: Response) => {
  const db = getDb();
  if (req.teacherRole !== 'parent') {
    res.status(403).json({ error: '仅家长可操作' });
    return;
  }

  const { student_id, message } = req.body;

  // 检查学生是否存在且活跃
  const student = db.get(
    `SELECT s.*, c.id as class_id, c.name as class_name, c.teacher_id
     FROM students s JOIN classes c ON s.class_id = c.id
     WHERE s.id = ? AND s.is_active = 1 AND c.is_archived = 0`,
    [student_id]
  );
  if (!student) {
    res.status(404).json({ error: '学生不存在' });
    return;
  }

  // 检查是否已经关联
  const alreadyLinked = db.get(
    'SELECT id FROM parent_students WHERE parent_id = ? AND student_id = ?',
    [req.teacherId, student_id]
  );
  if (alreadyLinked) {
    res.status(409).json({ error: '您已关联该学生' });
    return;
  }

  // 检查是否有待处理的申请
  const pendingRequest = db.get(
    'SELECT id FROM join_requests WHERE parent_id = ? AND student_id = ? AND status = ?',
    [req.teacherId, student_id, 'pending']
  );
  if (pendingRequest) {
    res.status(409).json({ error: '您已提交过申请，请等待老师审批' });
    return;
  }

  const id = crypto.randomUUID();
  db.run(
    'INSERT INTO join_requests (id, parent_id, student_id, class_id, message) VALUES (?, ?, ?, ?, ?)',
    [id, req.teacherId, student_id, (student as any).class_id, message || null]
  );

  const request = db.get('SELECT * FROM join_requests WHERE id = ?', [id]);
  res.status(201).json(request);
});

// 获取家长的加入申请状态
router.get('/join-requests', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDb();
  if (req.teacherRole !== 'parent') {
    res.status(403).json({ error: '仅家长可访问' });
    return;
  }

  const requests = db.all(
    `SELECT jr.*, s.name as student_name, c.name as class_name
     FROM join_requests jr
     JOIN students s ON jr.student_id = s.id
     JOIN classes c ON jr.class_id = c.id
     WHERE jr.parent_id = ?
     ORDER BY jr.created_at DESC`,
    [req.teacherId]
  );

  res.json({ data: requests });
});

// 获取班级学生列表（家长用，通过邀请码查看）
router.get('/class-students/:inviteCode', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDb();
  if (req.teacherRole !== 'parent') {
    res.status(403).json({ error: '仅家长可访问' });
    return;
  }

  const cls = db.get(
    'SELECT id, name, grade FROM classes WHERE invite_code = ? AND is_archived = 0',
    [req.params.inviteCode.trim().toUpperCase()]
  );
  if (!cls) {
    res.status(404).json({ error: '班级不存在' });
    return;
  }

  const students = db.all(
    'SELECT id, name, student_number, total_points FROM students WHERE class_id = ? AND is_active = 1 ORDER BY student_number, created_at',
    [(cls as any).id]
  );

  res.json({ data: students, class: cls });
});

export default router;
