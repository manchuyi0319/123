import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getDb } from '../database/connection';

const router = Router();
router.use(authMiddleware);

// 浏览全平台活跃班级
router.get('/classes', (req: AuthRequest, res: Response) => {
  const db = getDb();

  const classes = db.all(
    `SELECT c.id, c.name, c.grade, c.created_at,
            t.display_name AS teacher_name, t.username AS teacher_username,
            COUNT(s.id) AS student_count,
            COALESCE(SUM(s.total_points), 0) AS total_points
     FROM classes c
     JOIN teachers t ON c.teacher_id = t.id
     LEFT JOIN students s ON s.class_id = c.id AND s.is_active = 1
     WHERE c.is_archived = 0
     GROUP BY c.id
     ORDER BY student_count DESC, c.created_at DESC`
  );

  res.json({ data: classes });
});

// 查看某班级详情（只读）
router.get('/classes/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();

  const cls = db.get(
    `SELECT c.*, t.display_name AS teacher_name, t.username AS teacher_username
     FROM classes c
     JOIN teachers t ON c.teacher_id = t.id
     WHERE c.id = ? AND c.is_archived = 0`,
    [req.params.id]
  );

  if (!cls) {
    res.status(404).json({ error: '班级不存在' });
    return;
  }

  const students = db.all(
    `SELECT s.id, s.name, s.total_points, s.student_number
     FROM students s
     WHERE s.class_id = ? AND s.is_active = 1
     ORDER BY s.total_points DESC`,
    [req.params.id]
  );

  const pets = db.all(
    `SELECT sp.id, sp.nickname, sp.current_exp, sp.hatched_at,
            p.name AS pet_name, p.emoji, p.rarity,
            s2.name AS student_name
     FROM student_pets sp
     JOIN pets p ON sp.pet_id = p.id
     JOIN students s2 ON sp.student_id = s2.id
     WHERE s2.class_id = ? AND sp.is_active = 1 AND s2.is_active = 1
     ORDER BY sp.current_exp DESC`,
    [req.params.id]
  );

  res.json({ ...cls, students, pets });
});

export default router;
