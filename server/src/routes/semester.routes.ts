import { Router, Response } from 'express';
import crypto from 'crypto';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateSemesterRewardsSchema } from '../validators/semester.validator';
import { getDb } from '../database/connection';

const router = Router();
router.use(authMiddleware);

// 获取奖励配置
router.get('/rewards', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const rewards = db.all(
    'SELECT * FROM semester_rewards ORDER BY category, rank_start'
  );
  res.json({ data: rewards });
});

// 保存奖励配置（管理员，全量替换）
router.put('/rewards', validate(updateSemesterRewardsSchema), (req: AuthRequest, res: Response) => {
  if (req.teacherRole !== 'admin') {
    res.status(403).json({ error: '仅管理员可配置学期奖励' });
    return;
  }

  const db = getDb();
  const { rewards } = req.body;

  // 全量替换：删除旧数据，插入新数据
  db.run('DELETE FROM semester_rewards');

  for (const r of rewards) {
    const id = r.id || crypto.randomUUID();
    db.run(
      'INSERT INTO semester_rewards (id, category, rank_start, rank_end, reward) VALUES (?, ?, ?, ?, ?)',
      [id, r.category, r.rank_start, r.rank_end, r.reward]
    );
  }

  const updated = db.all('SELECT * FROM semester_rewards ORDER BY category, rank_start');
  res.json({ data: updated });
});

// 学生积分榜 Top 10（全平台）
router.get('/rankings/students', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const students = db.all(
    `SELECT s.id, s.name, s.total_points, c.name AS class_name, c.grade
     FROM students s
     JOIN classes c ON s.class_id = c.id
     WHERE s.is_active = 1 AND c.is_archived = 0
     ORDER BY s.total_points DESC
     LIMIT 10`
  );
  res.json({ data: students });
});

// 宠物等级榜 Top 10（全平台）
router.get('/rankings/pets', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const pets = db.all(
    `SELECT sp.id, sp.nickname, sp.current_exp,
            p.name AS pet_name, p.emoji, p.rarity,
            s.name AS student_name, s.id AS student_id,
            c.name AS class_name
     FROM student_pets sp
     JOIN pets p ON sp.pet_id = p.id
     JOIN students s ON sp.student_id = s.id
     JOIN classes c ON s.class_id = c.id
     WHERE sp.is_active = 1 AND s.is_active = 1 AND c.is_archived = 0
     ORDER BY sp.current_exp DESC
     LIMIT 10`
  );
  res.json({ data: pets });
});

// 班级平均分榜 Top 10（全平台）
router.get('/rankings/classes', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const classes = db.all(
    `SELECT c.id, c.name, c.grade, c.school,
            COUNT(s.id) AS student_count,
            COALESCE(ROUND(AVG(s.total_points), 1), 0) AS avg_points
     FROM classes c
     LEFT JOIN students s ON s.class_id = c.id AND s.is_active = 1
     WHERE c.is_archived = 0
     GROUP BY c.id
     ORDER BY avg_points DESC
     LIMIT 10`
  );
  res.json({ data: classes });
});

export default router;
