import { Router, Response } from 'express';
import crypto from 'crypto';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createAnnouncementSchema, updateAnnouncementSchema } from '../validators/announcement.validator';
import { getDb } from '../database/connection';

const router = Router();
router.use(authMiddleware);

// 获取公告列表
router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const announcements = db.all(
    `SELECT a.*, t.display_name AS author_name
     FROM announcements a
     JOIN teachers t ON a.created_by = t.id
     ORDER BY a.is_pinned DESC, a.created_at DESC`
  );
  res.json({ data: announcements });
});

// 获取最新一条公告（通知栏用）
router.get('/latest', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const announcement = db.get(
    `SELECT a.*, t.display_name AS author_name
     FROM announcements a
     JOIN teachers t ON a.created_by = t.id
     ORDER BY a.is_pinned DESC, a.created_at DESC
     LIMIT 1`
  );
  res.json(announcement || null);
});

// 创建公告（管理员）
router.post('/', validate(createAnnouncementSchema), (req: AuthRequest, res: Response) => {
  if (req.teacherRole !== 'admin') {
    res.status(403).json({ error: '仅管理员可发布公告' });
    return;
  }

  const db = getDb();
  const { title, content, is_pinned } = req.body;
  const id = crypto.randomUUID();

  db.run(
    'INSERT INTO announcements (id, title, content, created_by, is_pinned) VALUES (?, ?, ?, ?, ?)',
    [id, title, content, req.teacherId, is_pinned ? 1 : 0]
  );

  const announcement = db.get(
    `SELECT a.*, t.display_name AS author_name
     FROM announcements a
     JOIN teachers t ON a.created_by = t.id
     WHERE a.id = ?`,
    [id]
  );

  res.status(201).json(announcement);
});

// 编辑公告（管理员）
router.patch('/:id', validate(updateAnnouncementSchema), (req: AuthRequest, res: Response) => {
  if (req.teacherRole !== 'admin') {
    res.status(403).json({ error: '仅管理员可编辑公告' });
    return;
  }

  const db = getDb();
  const existing = db.get('SELECT id FROM announcements WHERE id = ?', [req.params.id]);
  if (!existing) {
    res.status(404).json({ error: '公告不存在' });
    return;
  }

  const updates: string[] = [];
  const params: any[] = [];

  for (const key of ['title', 'content', 'is_pinned']) {
    if (req.body[key] !== undefined) {
      updates.push(`${key} = ?`);
      params.push(req.body[key]);
    }
  }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);
    db.run(`UPDATE announcements SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  const announcement = db.get(
    `SELECT a.*, t.display_name AS author_name
     FROM announcements a
     JOIN teachers t ON a.created_by = t.id
     WHERE a.id = ?`,
    [req.params.id]
  );

  res.json(announcement);
});

// 删除公告（管理员）
router.delete('/:id', (req: AuthRequest, res: Response) => {
  if (req.teacherRole !== 'admin') {
    res.status(403).json({ error: '仅管理员可删除公告' });
    return;
  }

  const db = getDb();
  const existing = db.get('SELECT id FROM announcements WHERE id = ?', [req.params.id]);
  if (!existing) {
    res.status(404).json({ error: '公告不存在' });
    return;
  }

  db.run('DELETE FROM announcements WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

export default router;
