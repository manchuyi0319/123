import { Router, Response } from 'express';
import crypto from 'crypto';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { adoptPetSchema, feedPetSchema } from '../validators/pet.validator';
import { getDb } from '../database/connection';
import { getLevel } from 'shared';

const router = Router();
router.use(authMiddleware);

const FEED_COST = 5;

// 获取所有宠物图鉴
router.get('/', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  const pets = db.all('SELECT * FROM pets ORDER BY sort_order');
  res.json({ data: pets });
});

// 领养宠物
router.post('/adopt', validate(adoptPetSchema), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { student_id, pet_id, nickname } = req.body;

  // 验证学生属于该教师
  const student = db.get(
    `SELECT s.id, s.total_points FROM students s
     JOIN classes c ON s.class_id = c.id
     WHERE s.id = ? AND c.teacher_id = ? AND s.is_active = 1`,
    [student_id, req.teacherId]
  );
  if (!student) { res.status(404).json({ error: '学生不存在或无权操作' }); return; }

  // 验证宠物存在
  const pet = db.get('SELECT * FROM pets WHERE id = ?', [pet_id]);
  if (!pet) { res.status(404).json({ error: '宠物不存在' }); return; }

  // 检查是否已领养该种宠物
  const existing = db.get(
    'SELECT id FROM student_pets WHERE student_id = ? AND pet_id = ?',
    [student_id, pet_id]
  );
  if (existing) { res.status(409).json({ error: '该学生已拥有此宠物' }); return; }

  // 领养需要消耗积分（稀有度不同消耗不同）
  const rarityCost: Record<string, number> = { common: 0, rare: 10, epic: 30, legendary: 50 };
  const cost = rarityCost[(pet as any).rarity] || 0;
  const currentPoints = (student as any).total_points;

  if (currentPoints < cost) {
    res.status(400).json({ error: `积分不足，领养${(pet as any).name}需要 ${cost} 积分，当前 ${currentPoints} 积分` });
    return;
  }

  const id = crypto.randomUUID();
  db.run(
    'INSERT INTO student_pets (id, student_id, pet_id, nickname) VALUES (?, ?, ?, ?)',
    [id, student_id, pet_id, nickname || null]
  );

  if (cost > 0) {
    const pointId = crypto.randomUUID();
    db.run(
      'INSERT INTO point_records (id, student_id, teacher_id, points_change, reason, category) VALUES (?, ?, ?, ?, ?, ?)',
      [pointId, student_id, req.teacherId, -cost, `领养${(pet as any).name}`, 'feeding']
    );
    db.run('UPDATE students SET total_points = total_points + ?, updated_at = datetime(\'now\') WHERE id = ?', [-cost, student_id]);
  }

  const studentPet = db.get(
    `SELECT sp.*, p.name as pet_name, p.species, p.emoji, p.rarity
     FROM student_pets sp JOIN pets p ON sp.pet_id = p.id
     WHERE sp.id = ?`, [id]
  );
  res.status(201).json(studentPet);
});

// 喂养宠物
router.post('/feed', validate(feedPetSchema), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { student_pet_id } = req.body;

  // 验证宠物属于该教师的学生
  const studentPet = db.get(
    `SELECT sp.*, s.total_points, s.id as student_id, p.name as pet_name
     FROM student_pets sp
     JOIN students s ON sp.student_id = s.id
     JOIN classes c ON s.class_id = c.id
     JOIN pets p ON sp.pet_id = p.id
     WHERE sp.id = ? AND c.teacher_id = ? AND sp.is_active = 1`,
    [student_pet_id, req.teacherId]
  );
  if (!studentPet) { res.status(404).json({ error: '宠物不存在或无权操作' }); return; }

  const sp = studentPet as any;
  if (sp.total_points < FEED_COST) {
    res.status(400).json({ error: `积分不足，喂养需要 ${FEED_COST} 积分，当前 ${sp.total_points} 积分` });
    return;
  }

  // 随机获得 10-30 经验
  const expGain = Math.floor(Math.random() * 21) + 10;

  db.run(
    "UPDATE student_pets SET current_exp = current_exp + ?, last_fed_at = datetime('now') WHERE id = ?",
    [expGain, student_pet_id]
  );

  // 扣除积分
  const pointId = crypto.randomUUID();
  db.run(
    'INSERT INTO point_records (id, student_id, teacher_id, points_change, reason, category) VALUES (?, ?, ?, ?, ?, ?)',
    [pointId, sp.student_id, req.teacherId, -FEED_COST, `喂养${sp.pet_name} +${expGain}EXP`, 'feeding']
  );
  db.run('UPDATE students SET total_points = total_points + ? WHERE id = ?', [-FEED_COST, sp.student_id]);

  const updated = db.get(
    `SELECT sp.*, p.name as pet_name, p.species, p.emoji, p.rarity
     FROM student_pets sp JOIN pets p ON sp.pet_id = p.id WHERE sp.id = ?`,
    [student_pet_id]
  );
  res.json({ ...updated, exp_gain: expGain });
});

// 一键喂养某学生所有宠物
router.post('/feed-all', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { student_id } = req.body;

  // 验证学生属于该教师
  const student = db.get(
    `SELECT s.id, s.total_points FROM students s
     JOIN classes c ON s.class_id = c.id
     WHERE s.id = ? AND c.teacher_id = ? AND s.is_active = 1`,
    [student_id, req.teacherId]
  );
  if (!student) { res.status(404).json({ error: '学生不存在或无权操作' }); return; }

  const pets = db.all(
    `SELECT sp.*, p.name as pet_name, p.emoji, p.rarity
     FROM student_pets sp JOIN pets p ON sp.pet_id = p.id
     WHERE sp.student_id = ? AND sp.is_active = 1`,
    [student_id]
  );
  if (pets.length === 0) { res.status(400).json({ error: '该学生没有宠物' }); return; }

  const st = student as any;
  const totalCost = pets.length * FEED_COST;
  if (st.total_points < totalCost) {
    res.status(400).json({ error: `积分不足，喂养 ${pets.length} 只宠物需要 ${totalCost} 积分，当前 ${st.total_points} 积分` });
    return;
  }

  const results: any[] = [];
  let totalExpGain = 0;
  let levelUps = 0;

  for (const sp of pets) {
    const oldLevel = getLevel((sp as any).current_exp || 0);
    const expGain = Math.floor(Math.random() * 21) + 10;

    db.run(
      "UPDATE student_pets SET current_exp = current_exp + ?, last_fed_at = datetime('now') WHERE id = ?",
      [expGain, (sp as any).id]
    );

    const newExp = (sp as any).current_exp + expGain;
    if (getLevel(newExp) > oldLevel) levelUps++;

    totalExpGain += expGain;

    const updated = db.get(
      `SELECT sp.*, p.name as pet_name, p.species, p.emoji, p.rarity
       FROM student_pets sp JOIN pets p ON sp.pet_id = p.id WHERE sp.id = ?`,
      [(sp as any).id]
    );
    results.push(updated);
  }

  // 扣除总积分
  const pointId = crypto.randomUUID();
  db.run(
    'INSERT INTO point_records (id, student_id, teacher_id, points_change, reason, category) VALUES (?, ?, ?, ?, ?, ?)',
    [pointId, student_id, req.teacherId, -totalCost, `一键喂养 ${pets.length} 只宠物 +${totalExpGain}EXP`, 'feeding']
  );
  db.run('UPDATE students SET total_points = total_points + ? WHERE id = ?', [-totalCost, student_id]);

  res.json({
    data: results,
    total_exp_gain: totalExpGain,
    total_cost: totalCost,
    pet_count: pets.length,
    level_ups: levelUps,
  });
});

// 获取某个学生的宠物列表
router.get('/student/:studentId', (req: AuthRequest, res: Response) => {
  const db = getDb();

  const student = db.get(
    `SELECT s.id FROM students s JOIN classes c ON s.class_id = c.id
     WHERE s.id = ? AND c.teacher_id = ?`,
    [req.params.studentId, req.teacherId]
  );
  if (!student) { res.status(404).json({ error: '学生不存在或无权操作' }); return; }

  const pets = db.all(
    `SELECT sp.*, p.name as pet_name, p.species, p.emoji, p.rarity
     FROM student_pets sp JOIN pets p ON sp.pet_id = p.id
     WHERE sp.student_id = ? AND sp.is_active = 1
     ORDER BY sp.hatched_at DESC`,
    [req.params.studentId]
  );

  res.json({ data: pets });
});

export default router;
