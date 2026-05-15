import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getDb } from '../database/connection';

const router = Router();
router.use(authMiddleware);

// 获取商城宠物列表（按稀有度分组，含价格）
router.get('/', (_req: AuthRequest, res: Response) => {
  const db = getDb();
  const pets = db.all('SELECT * FROM pets ORDER BY sort_order');
  res.json({ data: pets });
});

// 获取用户金币余额
router.get('/wallet', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const user = db.get('SELECT id, coins FROM teachers WHERE id = ?', [req.teacherId]) as any;
  res.json({ coins: user?.coins || 0 });
});

// 金币流水记录
router.get('/wallet/records', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const records = db.all(
    'SELECT * FROM coin_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.teacherId]
  );
  res.json({ data: records });
});

// 兑换充值码
router.post('/wallet/redeem', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { code } = req.body;

  if (!code || typeof code !== 'string' || code.trim().length < 6) {
    res.status(400).json({ error: '请输入有效的充值码' });
    return;
  }

  const rechargeCode = db.get(
    'SELECT * FROM recharge_codes WHERE code = ?',
    [code.trim().toUpperCase()]
  ) as any;

  if (!rechargeCode) {
    res.status(400).json({ error: '充值码无效' });
    return;
  }
  if (rechargeCode.is_used) {
    res.status(400).json({ error: '该充值码已被使用' });
    return;
  }

  // 标记充值码已使用
  db.run(
    "UPDATE recharge_codes SET is_used = 1, used_by = ?, used_at = datetime('now') WHERE id = ?",
    [req.teacherId, rechargeCode.id]
  );

  // 增加用户金币
  db.run('UPDATE teachers SET coins = coins + ? WHERE id = ?', [rechargeCode.coins, req.teacherId]);

  // 记录流水
  const coinRecordId = require('crypto').randomUUID();
  db.run(
    'INSERT INTO coin_records (id, user_id, amount, reason) VALUES (?, ?, ?, ?)',
    [coinRecordId, req.teacherId, rechargeCode.coins, `兑换充值码 +${rechargeCode.coins} 金币`]
  );

  const user = db.get('SELECT coins FROM teachers WHERE id = ?', [req.teacherId]) as any;
  res.json({ coins: user.coins, added: rechargeCode.coins, message: `成功兑换 ${rechargeCode.coins} 金币！` });
});

export default router;
