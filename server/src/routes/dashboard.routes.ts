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

// 本周积分 Top 5
router.get('/weekly-top5', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDb();

  const top5 = db.all(
    `SELECT s.id, s.name, c.name AS class_name,
            COALESCE(SUM(pr.points_change), 0) AS weekly_points
     FROM point_records pr
     JOIN students s ON pr.student_id = s.id
     JOIN classes c ON s.class_id = c.id
     WHERE pr.teacher_id = ?
       AND c.is_archived = 0 AND s.is_active = 1
       AND pr.created_at >= datetime('now', '-7 days')
     GROUP BY s.id
     ORDER BY weekly_points DESC
     LIMIT 5`,
    [req.teacherId]
  );

  res.json({ data: top5 });
});

// 最新领养宠物
router.get('/recent-pets', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDb();

  const pets = db.all(
    `SELECT sp.id, sp.nickname, sp.hatched_at, sp.current_exp,
            p.name AS pet_name, p.emoji, p.rarity,
            s.name AS student_name,
            c.name AS class_name
     FROM student_pets sp
     JOIN pets p ON sp.pet_id = p.id
     JOIN students s ON sp.student_id = s.id
     JOIN classes c ON s.class_id = c.id
     WHERE c.teacher_id = ? AND sp.is_active = 1 AND s.is_active = 1 AND c.is_archived = 0
     ORDER BY sp.hatched_at DESC
     LIMIT 5`,
    [req.teacherId]
  );

  res.json({ data: pets });
});

export default router;
