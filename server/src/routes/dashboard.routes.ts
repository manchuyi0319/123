import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getDb } from '../database/connection';

const router = Router();

function isGlobal(req: AuthRequest): boolean {
  return req.query.scope === 'all';
}

router.get('/stats', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const global = isGlobal(req);

  const classCount = db.get(
    `SELECT COUNT(*) as count FROM classes WHERE is_archived = 0${global ? '' : ' AND teacher_id = ?'}`,
    global ? [] : [req.teacherId]
  ) as any;
  const studentCount = db.get(
    `SELECT COUNT(*) as count FROM students s
     JOIN classes c ON s.class_id = c.id
     WHERE s.is_active = 1 AND c.is_archived = 0${global ? '' : ' AND c.teacher_id = ?'}`,
    global ? [] : [req.teacherId]
  ) as any;
  const petCount = db.get(
    `SELECT COUNT(*) as count FROM student_pets sp
     JOIN students s ON sp.student_id = s.id
     JOIN classes c ON s.class_id = c.id
     WHERE sp.is_active = 1 AND c.is_archived = 0${global ? '' : ' AND c.teacher_id = ?'}`,
    global ? [] : [req.teacherId]
  ) as any;
  const todayPoints = db.get(
    `SELECT COALESCE(SUM(points_change), 0) as total FROM point_records
     WHERE date(created_at) = date('now')${global ? '' : ' AND teacher_id = ?'}`,
    global ? [] : [req.teacherId]
  ) as any;

  res.json({
    classCount: classCount.count,
    studentCount: studentCount.count,
    petCount: petCount.count,
    todayPoints: todayPoints.total,
  });
});

// 本周积分 Top 10
router.get('/weekly-top10', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const global = isGlobal(req);

  const top10 = db.all(
    `SELECT s.id, s.name, c.name AS class_name,
            COALESCE(SUM(pr.points_change), 0) AS weekly_points
     FROM point_records pr
     JOIN students s ON pr.student_id = s.id
     JOIN classes c ON s.class_id = c.id
     WHERE c.is_archived = 0 AND s.is_active = 1
       AND pr.created_at >= datetime('now', '-7 days')
       ${global ? '' : 'AND pr.teacher_id = ?'}
     GROUP BY s.id
     ORDER BY weekly_points DESC
     LIMIT 10`,
    global ? [] : [req.teacherId]
  );

  res.json({ data: top10 });
});

// 最新领养宠物
router.get('/recent-pets', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const global = isGlobal(req);

  const pets = db.all(
    `SELECT sp.id, sp.nickname, sp.hatched_at, sp.current_exp,
            p.name AS pet_name, p.emoji, p.rarity,
            s.name AS student_name,
            c.name AS class_name
     FROM student_pets sp
     JOIN pets p ON sp.pet_id = p.id
     JOIN students s ON sp.student_id = s.id
     JOIN classes c ON s.class_id = c.id
     WHERE sp.is_active = 1 AND s.is_active = 1 AND c.is_archived = 0
       ${global ? '' : 'AND c.teacher_id = ?'}
     ORDER BY sp.hatched_at DESC
     LIMIT 10`,
    global ? [] : [req.teacherId]
  );

  res.json({ data: pets });
});

export default router;
