import { Database } from './connection';
import crypto from 'crypto';
import { DEFAULT_PETS, DEFAULT_PRESETS } from 'shared';
import { generateAllQuestions, QuizQuestionInput } from './quiz-seed';

export function runSeed(database: Database): void {
  // 确保永久管理员 505694933@qq.com 始终拥有 admin 角色
  const permAdmin = database.get('SELECT id FROM teachers WHERE username = ?', ['505694933@qq.com']) as any;
  if (permAdmin) {
    database.run('UPDATE teachers SET role = ? WHERE username = ?', ['admin', '505694933@qq.com']);
  }

  // 如果没有管理员，将第一个注册的教师提升为管理员（兜底）
  const adminCount = database.get('SELECT COUNT(*) as count FROM teachers WHERE role = ?', ['admin']) as any;
  if (adminCount.count === 0) {
    const firstTeacher = database.get('SELECT id FROM teachers ORDER BY created_at ASC LIMIT 1') as any;
    if (firstTeacher) {
      database.run('UPDATE teachers SET role = ? WHERE id = ?', ['admin', firstTeacher.id]);
      console.log('  Seed: promoted first teacher to admin');
    }
  }

  // 同步宠物物种数据（支持新增和更新）
  const existingCount = database.get('SELECT COUNT(*) as count FROM pets') as any;
  if (existingCount.count === 0) {
    // 全新安装：插入所有物种
    for (const pet of DEFAULT_PETS) {
      database.run(
        'INSERT INTO pets (id, name, species, description, emoji, rarity, price, sort_order, image_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), pet.name, pet.species, pet.description, pet.emoji, pet.rarity, pet.price, pet.sort_order, pet.imageKey || null]
      );
    }
  } else {
    // 升级：更新已有物种的 price，插入新物种
    for (const pet of DEFAULT_PETS) {
      const existing = database.get('SELECT id FROM pets WHERE species = ?', [pet.species]) as any;
      if (existing) {
        database.run(
          'UPDATE pets SET name = ?, description = ?, emoji = ?, rarity = ?, price = ?, sort_order = ?, image_key = ? WHERE species = ?',
          [pet.name, pet.description, pet.emoji, pet.rarity, pet.price, pet.sort_order, pet.imageKey || null, pet.species]
        );
      } else {
        database.run(
          'INSERT INTO pets (id, name, species, description, emoji, rarity, price, sort_order, image_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [crypto.randomUUID(), pet.name, pet.species, pet.description, pet.emoji, pet.rarity, pet.price, pet.sort_order, pet.imageKey || null]
        );
      }
    }
  }

  // 同步预设评价规则
  const rulesCount = database.get('SELECT COUNT(*) as count FROM evaluation_rules') as any;
  if (rulesCount.count === 0) {
    for (const rule of DEFAULT_PRESETS) {
      database.run(
        'INSERT INTO evaluation_rules (id, teacher_id, name, description, points_value, category, icon, is_preset, sort_order) VALUES (?, NULL, ?, ?, ?, ?, ?, 1, ?)',
        [crypto.randomUUID(), rule.name, rule.description, rule.points_value, rule.category, rule.icon, rule.sort_order]
      );
    }
  }

  // 同步竞赛题库
  const quizCount = database.get('SELECT COUNT(*) as count FROM quiz_questions') as any;
  if (quizCount.count === 0) {
    const questions = generateAllQuestions();
    console.log(`  Seed: inserting ${questions.length} quiz questions...`);
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      try {
        database.run(
          'INSERT INTO quiz_questions (id, question, options, answer, explanation, grade, subject, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [crypto.randomUUID(), q.question, JSON.stringify(q.options), q.answer, q.explanation, q.grade, q.subject, q.difficulty]
        );
      } catch (err: any) {
        console.error(`  Seed: failed to insert quiz question #${i}: ${err.message}`);
        throw err;
      }
    }
    console.log(`  Seed: ${questions.length} quiz questions inserted`);
  }

  // 同步学期奖励默认配置
  const rewardsCount = database.get('SELECT COUNT(*) as count FROM semester_rewards') as any;
  if (rewardsCount.count === 0) {
    const defaultRewards = [
      { category: 'students', rank_start: 1, rank_end: 1, reward: '冠军奖品（待配置）' },
      { category: 'students', rank_start: 2, rank_end: 2, reward: '亚军奖品（待配置）' },
      { category: 'students', rank_start: 3, rank_end: 3, reward: '季军奖品（待配置）' },
      { category: 'students', rank_start: 4, rank_end: 10, reward: '优秀奖（待配置）' },
      { category: 'pets', rank_start: 1, rank_end: 1, reward: '冠军奖品（待配置）' },
      { category: 'pets', rank_start: 2, rank_end: 2, reward: '亚军奖品（待配置）' },
      { category: 'pets', rank_start: 3, rank_end: 3, reward: '季军奖品（待配置）' },
      { category: 'pets', rank_start: 4, rank_end: 10, reward: '优秀奖（待配置）' },
      { category: 'classes', rank_start: 1, rank_end: 1, reward: '冠军班级奖品（待配置）' },
      { category: 'classes', rank_start: 2, rank_end: 2, reward: '亚军班级奖品（待配置）' },
      { category: 'classes', rank_start: 3, rank_end: 3, reward: '季军班级奖品（待配置）' },
      { category: 'classes', rank_start: 4, rank_end: 6, reward: '优秀班级奖（待配置）' },
      { category: 'classes', rank_start: 7, rank_end: 10, reward: '鼓励奖（待配置）' },
    ];
    for (const r of defaultRewards) {
      database.run(
        'INSERT INTO semester_rewards (id, category, rank_start, rank_end, reward) VALUES (?, ?, ?, ?, ?)',
        [crypto.randomUUID(), r.category, r.rank_start, r.rank_end, r.reward]
      );
    }
  }

  console.log(`  Seed: ${DEFAULT_PETS.length} pets, ${DEFAULT_PRESETS.length} evaluation rules`);
}
