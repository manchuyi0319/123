import { Router, Response } from 'express';
import crypto from 'crypto';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { approveRejectSchema } from '../validators/parent.validator';
import { getDb } from '../database/connection';

const router = Router();
router.use(authMiddleware);

// 老师查看待审批的家长加入申请（自己的学生）
router.get('/', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { class_id, status } = req.query;

  let sql = `
    SELECT jr.*, s.name as student_name, c.name as class_name,
           t.display_name as parent_name, t.email as parent_email, t.phone as parent_phone
    FROM join_requests jr
    JOIN students s ON jr.student_id = s.id
    JOIN classes c ON jr.class_id = c.id
    JOIN teachers t ON jr.parent_id = t.id
    WHERE c.teacher_id = ?`;
  const params: any[] = [req.teacherId];

  if (class_id) {
    sql += ' AND jr.class_id = ?';
    params.push(class_id);
  }
  if (status) {
    sql += ' AND jr.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY jr.created_at DESC';

  const requests = db.all(sql, params);
  res.json({ data: requests });
});

// 老师审批通过/拒绝家长加入申请
router.post('/:id/approve', validate(approveRejectSchema), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { status } = req.body;

  try {
    const jr = db.get(
      `SELECT jr.*, c.teacher_id
       FROM join_requests jr
       JOIN classes c ON jr.class_id = c.id
       WHERE jr.id = ?`,
      [req.params.id]
    ) as any;

    if (!jr) {
      res.status(404).json({ error: '申请不存在' });
      return;
    }

    if (jr.teacher_id !== req.teacherId) {
      res.status(403).json({ error: '无权审批此申请' });
      return;
    }

    if (jr.status !== 'pending') {
      res.status(400).json({ error: '该申请已处理' });
      return;
    }

    // 更新申请状态
    db.run(
      "UPDATE join_requests SET status = ?, updated_at = datetime('now') WHERE id = ?",
      [status, req.params.id]
    );

    // 如果审批通过，建立家长-学生关联
    if (status === 'approved') {
      const existing = db.get(
        'SELECT id FROM parent_students WHERE parent_id = ? AND student_id = ?',
        [jr.parent_id, jr.student_id]
      );
      if (!existing) {
        const id = crypto.randomUUID();
        db.run(
          'INSERT INTO parent_students (id, parent_id, student_id) VALUES (?, ?, ?)',
          [id, jr.parent_id, jr.student_id]
        );
      }
    }

    const updated = db.get(
      `SELECT jr.*, s.name as student_name, c.name as class_name,
              t.display_name as parent_name
       FROM join_requests jr
       JOIN students s ON jr.student_id = s.id
       JOIN classes c ON jr.class_id = c.id
       JOIN teachers t ON jr.parent_id = t.id
       WHERE jr.id = ?`,
      [req.params.id]
    );

    res.json(updated);
  } catch (err) {
    console.error('Approve join request error:', err);
    res.status(500).json({ error: '审批处理失败' });
  }
});

// 获取某个学生的加入申请
router.get('/student/:studentId', (req: AuthRequest, res: Response) => {
  const db = getDb();

  // 验证老师拥有该学生
  const student = db.get(
    `SELECT s.*, c.teacher_id FROM students s
     JOIN classes c ON s.class_id = c.id
     WHERE s.id = ?`,
    [req.params.studentId]
  ) as any;

  if (!student || student.teacher_id !== req.teacherId) {
    res.status(404).json({ error: '学生不存在' });
    return;
  }

  const requests = db.all(
    `SELECT jr.*, t.display_name as parent_name, t.email as parent_email
     FROM join_requests jr
     JOIN teachers t ON jr.parent_id = t.id
     WHERE jr.student_id = ?
     ORDER BY jr.created_at DESC`,
    [req.params.studentId]
  );

  res.json({ data: requests });
});

export default router;
