import { Database } from './connection';
import crypto from 'crypto';
import { DEFAULT_PETS, DEFAULT_PRESETS } from 'shared';

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

  const result = database.get('SELECT COUNT(*) as count FROM pets');
  if ((result as any).count > 0) return;

  for (const pet of DEFAULT_PETS) {
    database.run(
      'INSERT INTO pets (id, name, species, description, emoji, rarity, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), pet.name, pet.species, pet.description, pet.emoji, pet.rarity, pet.sort_order]
    );
  }

  for (const rule of DEFAULT_PRESETS) {
    database.run(
      'INSERT INTO evaluation_rules (id, teacher_id, name, description, points_value, category, icon, is_preset, sort_order) VALUES (?, NULL, ?, ?, ?, ?, ?, 1, ?)',
      [crypto.randomUUID(), rule.name, rule.description, rule.points_value, rule.category, rule.icon, rule.sort_order]
    );
  }

  console.log(`  Seed: ${DEFAULT_PETS.length} pets, ${DEFAULT_PRESETS.length} evaluation rules`);
}
