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

  // 同步宠物物种数据（支持新增和更新）
  const existingCount = database.get('SELECT COUNT(*) as count FROM pets') as any;
  if (existingCount.count === 0) {
    // 全新安装：插入所有物种
    for (const pet of DEFAULT_PETS) {
      database.run(
        'INSERT INTO pets (id, name, species, description, emoji, rarity, price, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), pet.name, pet.species, pet.description, pet.emoji, pet.rarity, pet.price, pet.sort_order]
      );
    }
  } else {
    // 升级：更新已有物种的 price，插入新物种
    for (const pet of DEFAULT_PETS) {
      const existing = database.get('SELECT id FROM pets WHERE species = ?', [pet.species]) as any;
      if (existing) {
        database.run(
          'UPDATE pets SET name = ?, description = ?, emoji = ?, rarity = ?, price = ?, sort_order = ? WHERE species = ?',
          [pet.name, pet.description, pet.emoji, pet.rarity, pet.price, pet.sort_order, pet.species]
        );
      } else {
        database.run(
          'INSERT INTO pets (id, name, species, description, emoji, rarity, price, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [crypto.randomUUID(), pet.name, pet.species, pet.description, pet.emoji, pet.rarity, pet.price, pet.sort_order]
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

  console.log(`  Seed: ${DEFAULT_PETS.length} pets, ${DEFAULT_PRESETS.length} evaluation rules`);
}
