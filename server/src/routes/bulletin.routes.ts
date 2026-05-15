import { Router, Response } from 'express';
import crypto from 'crypto';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBulletinPostSchema } from '../validators/bulletin.validator';
import { getDb } from '../database/connection';
import { filterContent } from '../utils/profanity-filter';

const router = Router();
router.use(authMiddleware);

// 获取帖子列表
router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const posts = db.all(
    `SELECT bp.*, t.display_name AS author_name, t.avatar_url AS author_avatar, t.role AS author_role
     FROM bulletin_posts bp
     JOIN teachers t ON bp.author_id = t.id
     ORDER BY bp.created_at DESC`
  );
  res.json({ data: posts });
});

// 发帖
router.post('/', validate(createBulletinPostSchema), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { title, content } = req.body;

  const titleCheck = filterContent(title);
  const contentCheck = filterContent(content);
  const allWords = [...new Set([...titleCheck.words, ...contentCheck.words])];

  if (!titleCheck.clean || !contentCheck.clean) {
    res.status(400).json({
      error: '内容包含不当词汇，请修改后重新提交',
      words: allWords,
    });
    return;
  }

  const id = crypto.randomUUID();
  db.run(
    'INSERT INTO bulletin_posts (id, author_id, title, content) VALUES (?, ?, ?, ?)',
    [id, req.teacherId, titleCheck.filtered, contentCheck.filtered]
  );

  const post = db.get(
    `SELECT bp.*, t.display_name AS author_name, t.avatar_url AS author_avatar, t.role AS author_role
     FROM bulletin_posts bp
     JOIN teachers t ON bp.author_id = t.id
     WHERE bp.id = ?`,
    [id]
  );

  res.status(201).json(post);
});

// 删除帖子（作者本人或管理员）
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const post = db.get('SELECT * FROM bulletin_posts WHERE id = ?', [req.params.id]) as any;

  if (!post) {
    res.status(404).json({ error: '帖子不存在' });
    return;
  }

  if (req.teacherRole !== 'admin' && post.author_id !== req.teacherId) {
    res.status(403).json({ error: '无权删除此帖子' });
    return;
  }

  db.run('DELETE FROM bulletin_posts WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

export default router;
