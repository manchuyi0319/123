import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getDb } from '../database/connection';

const router = Router();

router.get('/stats', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDb();

  const classCount = db.get('SELECT COUNT(*) as count FROM classes WHERE teacher_id = ? AND is_archived = 0', [req.teacherId]) as any;
  const studentCount = db.get(
    `SELECT COUNT(*) as count FROM students s
     JOIN classes c ON s.class_id = c.id
     WHERE c.teacher_id = ? AND s.is_active = 1 AND c.is_archived = 0`,
    [req.teacherId]
  ) as any;
  const petCount = db.get(
    `SELECT COUNT(*) as count FROM student_pets sp
     JOIN students s ON sp.student_id = s.id
     JOIN classes c ON s.class_id = c.id
     WHERE c.teacher_id = ? AND sp.is_active = 1 AND c.is_archived = 0`,
    [req.teacherId]
  ) as any;
  const todayPoints = db.get(
    `SELECT COALESCE(SUM(points_change), 0) as total FROM point_records
     WHERE teacher_id = ? AND date(created_at) = date('now')`,
    [req.teacherId]
  ) as any;

  res.json({
    classCount: classCount.count,
    studentCount: studentCount.count,
    petCount: petCount.count,
    todayPoints: todayPoints.total,
  });
});

export default router;
