import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { rankingsQuerySchema } from '../validators/rankings.validator';
import { getDb } from '../database/connection';

const router = Router();
router.use(authMiddleware);

function verifyClassOwnership(classId: string, teacherId: string): boolean {
  const c = getDb().get(
    'SELECT id FROM classes WHERE id = ? AND teacher_id = ? AND is_archived = 0',
    [classId, teacherId]
  );
  return !!c;
}

function classExists(classId: string): boolean {
  const c = getDb().get(
    'SELECT id FROM classes WHERE id = ? AND is_archived = 0',
    [classId]
  );
  return !!c;
}

// 学生积分排行榜
router.get('/students', validate(rankingsQuerySchema), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { class_id, scope } = req.query;
  const isGlobal = scope === 'all';

  if (class_id) {
    if (isGlobal) {
      if (!classExists(class_id as string)) {
        res.status(404).json({ error: '班级不存在' });
        return;
      }
    } else {
      if (!verifyClassOwnership(class_id as string, req.teacherId!)) {
        res.status(404).json({ error: '班级不存在或无权操作' });
        return;
      }
    }
  }

  const students = db.all(
    `SELECT s.id, s.name, s.total_points, c.name AS class_name, c.id AS class_id
     FROM students s
     JOIN classes c ON s.class_id = c.id
     WHERE s.is_active = 1 AND c.is_archived = 0
       ${isGlobal ? '' : 'AND c.teacher_id = ?'}
       AND (s.class_id = ? OR ? IS NULL)
     ORDER BY s.total_points DESC`,
    isGlobal
      ? [class_id || null, class_id || null]
      : [req.teacherId, class_id || null, class_id || null]
  );

  res.json({ data: students });
});

// 宠物等级排行榜
router.get('/pets', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const isGlobal = req.query.scope === 'all';

  const pets = db.all(
    `SELECT sp.id, sp.nickname, sp.current_exp,
            p.name AS pet_name, p.emoji, p.rarity,
            s.name AS student_name, s.id AS student_id,
            c.name AS class_name, c.id AS class_id
     FROM student_pets sp
     JOIN pets p ON sp.pet_id = p.id
     JOIN students s ON sp.student_id = s.id
     JOIN classes c ON s.class_id = c.id
     WHERE sp.is_active = 1 AND s.is_active = 1 AND c.is_archived = 0
       ${isGlobal ? '' : 'AND c.teacher_id = ?'}
     ORDER BY sp.current_exp DESC`,
    isGlobal ? [] : [req.teacherId]
  );

  res.json({ data: pets });
});

// 班级平均分排行榜
router.get('/classes', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const isGlobal = req.query.scope === 'all';

  const classes = db.all(
    `SELECT c.id, c.name, c.grade,
            COUNT(s.id) AS student_count,
            COALESCE(ROUND(AVG(s.total_points), 1), 0) AS avg_points
     FROM classes c
     LEFT JOIN students s ON s.class_id = c.id AND s.is_active = 1
     WHERE c.is_archived = 0
       ${isGlobal ? '' : 'AND c.teacher_id = ?'}
     GROUP BY c.id
     ORDER BY avg_points DESC`,
    isGlobal ? [] : [req.teacherId]
  );

  res.json({ data: classes });
});

export default router;
