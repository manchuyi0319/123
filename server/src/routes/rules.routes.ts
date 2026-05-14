import { Router, Response } from 'express';
import crypto from 'crypto';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createRuleSchema, updateRuleSchema } from '../validators/rules.validator';
import { getDb } from '../database/connection';

const router = Router();
router.use(authMiddleware);

// 获取评价规则（预设 + 自定义）
router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const rules = db.all(
    `SELECT * FROM evaluation_rules
     WHERE teacher_id IS NULL OR teacher_id = ?
     ORDER BY is_preset DESC, sort_order, created_at`,
    [req.teacherId]
  );
  res.json({ data: rules });
});

// 创建自定义规则
router.post('/', validate(createRuleSchema), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { name, description, points_value, category, icon } = req.body;
  const id = crypto.randomUUID();

  db.run(
    `INSERT INTO evaluation_rules (id, teacher_id, name, description, points_value, category, icon, is_preset, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 99)`,
    [id, req.teacherId, name, description || null, points_value, category, icon || null]
  );

  const rule = db.get('SELECT * FROM evaluation_rules WHERE id = ?', [id]);
  res.status(201).json(rule);
});

// 更新自定义规则
router.patch('/:id', validate(updateRuleSchema), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const rule = db.get(
    'SELECT * FROM evaluation_rules WHERE id = ? AND teacher_id = ? AND is_preset = 0',
    [req.params.id, req.teacherId]
  );
  if (!rule) {
    res.status(404).json({ error: '规则不存在或无法编辑预设规则' });
    return;
  }

  const updates: string[] = [];
  const params: any[] = [];

  for (const key of ['name', 'description', 'points_value', 'category', 'icon']) {
    if (req.body[key] !== undefined) {
      updates.push(`${key} = ?`);
      params.push(req.body[key]);
    }
  }

  if (updates.length > 0) {
    params.push(req.params.id);
    db.run(`UPDATE evaluation_rules SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  const updated = db.get('SELECT * FROM evaluation_rules WHERE id = ?', [req.params.id]);
  res.json(updated);
});

// 删除自定义规则
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const rule = db.get(
    'SELECT * FROM evaluation_rules WHERE id = ? AND teacher_id = ? AND is_preset = 0',
    [req.params.id, req.teacherId]
  );
  if (!rule) {
    res.status(404).json({ error: '规则不存在或无法删除预设规则' });
    return;
  }

  db.run('DELETE FROM evaluation_rules WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

export default router;
