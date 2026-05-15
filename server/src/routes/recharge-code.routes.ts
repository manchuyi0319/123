import { Router, Response } from 'express';
import crypto from 'crypto';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { getDb } from '../database/connection';

const router = Router();
router.use(authMiddleware);

// 管理员生成充值码
router.post('/generate', adminMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { coins, count } = req.body;

  const coinAmount = parseInt(coins, 10);
  if (!coinAmount || coinAmount < 1 || coinAmount > 1000) {
    res.status(400).json({ error: '金币数量需在 1-1000 之间' });
    return;
  }

  const codeCount = Math.min(parseInt(count, 10) || 1, 100);

  const codes: string[] = [];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  for (let i = 0; i < codeCount; i++) {
    let code = '';
    for (let j = 0; j < 12; j++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    // 4段格式: XXXX-XXXX-XXXX
    code = `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;

    const id = crypto.randomUUID();
    db.run(
      'INSERT INTO recharge_codes (id, code, coins, created_by) VALUES (?, ?, ?, ?)',
      [id, code, coinAmount, req.teacherId]
    );
    codes.push(code);
  }

  res.status(201).json({ codes, coins: coinAmount, count: codeCount });
});

// 管理员查看充值码列表
router.get('/list', adminMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { is_used } = req.query;

  let sql = `
    SELECT rc.*, t.display_name as creator_name, u.display_name as user_name
    FROM recharge_codes rc
    JOIN teachers t ON rc.created_by = t.id
    LEFT JOIN teachers u ON rc.used_by = u.id`;
  const params: any[] = [];

  if (is_used === '0') {
    sql += ' WHERE rc.is_used = 0';
  } else if (is_used === '1') {
    sql += ' WHERE rc.is_used = 1';
  }

  sql += ' ORDER BY rc.created_at DESC LIMIT 200';

  const codes = db.all(sql, params);
  res.json({ data: codes });
});

export default router;
