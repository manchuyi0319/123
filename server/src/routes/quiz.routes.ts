import { Router, Response } from 'express';
import crypto from 'crypto';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { submitAnswerSchema } from '../validators/quiz.validator';
import { getDb } from '../database/connection';

const router = Router();
router.use(authMiddleware);

const MAX_DAILY_WRONG = 3;

function getToday(): string {
  const now = new Date();
  // 每天上午9点重置，9点之前算前一天
  if (now.getHours() < 9) {
    now.setDate(now.getDate() - 1);
  }
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function verifyStudentAccess(db: ReturnType<typeof getDb>, studentId: string, teacherId: string, teacherRole: string): boolean {
  if (teacherRole === 'admin') return true;

  const student = db.get(
    `SELECT s.id FROM students s
     JOIN classes c ON s.class_id = c.id
     WHERE s.id = ? AND c.teacher_id = ?`,
    [studentId, teacherId]
  );
  if (student) return true;

  const parentStudent = db.get(
    'SELECT 1 FROM parent_students WHERE parent_id = ? AND student_id = ?',
    [teacherId, studentId]
  );
  return !!parentStudent;
}

// 获取竞赛状态
router.get('/status', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const studentId = req.query.student_id as string;

  if (!studentId) {
    res.status(400).json({ error: '缺少 student_id 参数' });
    return;
  }

  if (!verifyStudentAccess(db, studentId, req.teacherId!, req.teacherRole!)) {
    res.status(403).json({ error: '无权访问该学生的竞赛数据' });
    return;
  }

  const student = db.get('SELECT quiz_level FROM students WHERE id = ?', [studentId]) as any;
  if (!student) {
    res.status(404).json({ error: '学生不存在' });
    return;
  }

  const today = getToday();
  const stats = db.get(
    'SELECT * FROM quiz_daily_stats WHERE student_id = ? AND date = ?',
    [studentId, today]
  ) as any;

  const todayWrong = stats?.questions_wrong || 0;
  const remaining = Math.max(0, MAX_DAILY_WRONG - todayWrong);

  res.json({
    quiz_level: student.quiz_level,
    today_wrong: todayWrong,
    max_daily_wrong: MAX_DAILY_WRONG,
    remaining,
    questions_answered_today: stats?.questions_answered || 0,
  });
});

// 获取一道随机题目
router.get('/question', (req: AuthRequest, res: Response) => {
  const db = getDb();
  const studentId = req.query.student_id as string;

  if (!studentId) {
    res.status(400).json({ error: '缺少 student_id 参数' });
    return;
  }

  if (!verifyStudentAccess(db, studentId, req.teacherId!, req.teacherRole!)) {
    res.status(403).json({ error: '无权为该学生获取题目' });
    return;
  }

  // 检查今日剩余次数
  const today = getToday();
  const stats = db.get(
    'SELECT questions_wrong FROM quiz_daily_stats WHERE student_id = ? AND date = ?',
    [studentId, today]
  ) as any;

  const todayWrong = stats?.questions_wrong || 0;
  if (todayWrong >= MAX_DAILY_WRONG) {
    res.status(400).json({ error: '今天的答题机会已用完，明天上午9点再来吧！', remaining: 0 });
    return;
  }

  // 获取学生年级
  const student = db.get(
    `SELECT s.id, s.quiz_level, c.grade FROM students s
     JOIN classes c ON s.class_id = c.id
     WHERE s.id = ?`,
    [studentId]
  ) as any;

  if (!student) {
    res.status(404).json({ error: '学生不存在' });
    return;
  }

  // 取该年级的随机一题
  const gradeNumber = student.grade ? parseInt(student.grade, 10) : 1;
  const grade = Math.min(Math.max(gradeNumber, 1), 9);

  // 排除今天已答过的题
  const answeredIds = db.all(
    'SELECT question_id FROM quiz_records WHERE student_id = ? AND date(created_at) = ?',
    [studentId, today]
  ).map((r: any) => r.question_id);

  let question: any;
  if (answeredIds.length > 0) {
    const placeholders = answeredIds.map(() => '?').join(',');
    question = db.get(
      `SELECT * FROM quiz_questions WHERE grade = ? AND id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT 1`,
      [grade, ...answeredIds]
    );
  } else {
    question = db.get(
      'SELECT * FROM quiz_questions WHERE grade = ? ORDER BY RANDOM() LIMIT 1',
      [grade]
    );
  }

  if (!question) {
    // 如果该年级题目不够，从所有年级中取
    question = db.get('SELECT * FROM quiz_questions ORDER BY RANDOM() LIMIT 1');
  }

  if (!question) {
    res.status(500).json({ error: '题库为空，请联系管理员' });
    return;
  }

  res.json({
    id: question.id,
    question: question.question,
    options: JSON.parse(question.options),
    grade: question.grade,
    subject: question.subject,
    quiz_level: student.quiz_level,
    remaining: MAX_DAILY_WRONG - todayWrong,
  });
});

// 提交答案
router.post('/answer', validate(submitAnswerSchema), (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { student_id, question_id, selected_answer } = req.body;

  if (!verifyStudentAccess(db, student_id, req.teacherId!, req.teacherRole!)) {
    res.status(403).json({ error: '无权为该学生提交答案' });
    return;
  }

  const question = db.get('SELECT * FROM quiz_questions WHERE id = ?', [question_id]) as any;
  if (!question) {
    res.status(404).json({ error: '题目不存在' });
    return;
  }

  const student = db.get(
    `SELECT s.id, s.quiz_level, s.total_points FROM students s WHERE s.id = ?`,
    [student_id]
  ) as any;

  if (!student) {
    res.status(404).json({ error: '学生不存在' });
    return;
  }

  const today = getToday();
  let stats = db.get(
    'SELECT * FROM quiz_daily_stats WHERE student_id = ? AND date = ?',
    [student_id, today]
  ) as any;

  const todayWrong = stats?.questions_wrong || 0;
  if (todayWrong >= MAX_DAILY_WRONG) {
    res.status(400).json({ error: '今天的答题机会已用完', remaining: 0 });
    return;
  }

  const isCorrect = selected_answer === question.answer;

  // 记录答题
  const recordId = crypto.randomUUID();
  db.run(
    'INSERT INTO quiz_records (id, student_id, teacher_id, question_id, selected_answer, is_correct, level) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [recordId, student_id, req.teacherId, question_id, selected_answer, isCorrect ? 1 : 0, student.quiz_level]
  );

  // 更新每日统计
  let pointsEarned = 0;
  let newLevel = student.quiz_level;

  if (!stats) {
    const statsId = crypto.randomUUID();
    db.run(
      'INSERT INTO quiz_daily_stats (id, student_id, date, questions_answered, questions_correct, questions_wrong, levels_gained, points_earned) VALUES (?, ?, ?, 1, ?, ?, 0, 0)',
      [statsId, student_id, today, isCorrect ? 1 : 0, isCorrect ? 0 : 1]
    );
  } else {
    db.run(
      'UPDATE quiz_daily_stats SET questions_answered = questions_answered + 1, questions_correct = questions_correct + ?, questions_wrong = questions_wrong + ? WHERE id = ?',
      [isCorrect ? 1 : 0, isCorrect ? 0 : 1, stats.id]
    );
  }

  if (isCorrect) {
    newLevel = student.quiz_level + 1;
    db.run('UPDATE students SET quiz_level = ? WHERE id = ?', [newLevel, student_id]);

    // 每10关奖励50积分
    if (newLevel % 10 === 0) {
      pointsEarned = 50;
      db.run('UPDATE students SET total_points = total_points + ? WHERE id = ?', [pointsEarned, student_id]);

      const pointRecordId = crypto.randomUUID();
      db.run(
        'INSERT INTO point_records (id, student_id, teacher_id, points_change, reason, category, evaluation_rule_id) VALUES (?, ?, ?, ?, ?, ?, NULL)',
        [pointRecordId, student_id, req.teacherId, pointsEarned, `竞赛闯关：通过第 ${newLevel} 关，奖励 ${pointsEarned} 积分`, 'custom']
      );

      // 更新每日统计的积分
      db.run(
        'UPDATE quiz_daily_stats SET points_earned = points_earned + ?, levels_gained = levels_gained + ? WHERE student_id = ? AND date = ?',
        [pointsEarned, 10, student_id, today]
      );
    } else {
      // 仅更新通过的关数
      db.run(
        'UPDATE quiz_daily_stats SET levels_gained = levels_gained + 1 WHERE student_id = ? AND date = ?',
        [student_id, today]
      );
    }
  }

  const remaining = Math.max(0, MAX_DAILY_WRONG - (todayWrong + (isCorrect ? 0 : 1)));

  res.json({
    correct: isCorrect,
    correct_answer: question.answer,
    explanation: question.explanation,
    selected_answer,
    new_level: newLevel,
    points_earned: pointsEarned,
    remaining: remaining,
    quiz_level: newLevel,
  });
});

export default router;
