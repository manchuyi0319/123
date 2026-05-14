import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { teacherRepo } from '../repositories/teacher.repo';
import { getDb } from '../database/connection';

const router = Router();
router.use(authMiddleware);
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
