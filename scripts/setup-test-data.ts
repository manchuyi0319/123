import { initDatabase, getDb } from '../server/src/database/connection';
import { runMigrations } from '../server/src/database/migrate';
import { runSeed } from '../server/src/database/seed';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

async function main() {
  await initDatabase();
  const db = getDb();
  runMigrations(db);
  runSeed(db);

  console.log('=== 当前状态 ===');

  // 查看现有教师
  const teachers = db.all("SELECT id, username, display_name, role FROM teachers WHERE role != 'parent'") as any[];
  console.log('教师账号:');
  teachers.forEach((t: any) => console.log(`  ${t.username} (${t.display_name}) - ${t.role}`));

  // 查看现有班级
  const classes = db.all('SELECT c.id, c.name, c.grade, c.teacher_id, t.username FROM classes c LEFT JOIN teachers t ON c.teacher_id = t.id LIMIT 20') as any[];
  console.log('\n班级:');
  classes.forEach((c: any) => console.log(`  ${c.name} (${c.grade}) - teacher: ${c.username}`));

  // 查看宠物分布
  const petSummary = db.all('SELECT rarity, COUNT(*) as cnt FROM pets GROUP BY rarity') as any[];
  console.log('\n宠物分布:');
  petSummary.forEach((p: any) => console.log(`  ${p.rarity}: ${p.cnt}`));

  // 家长账号
  const parents = db.all("SELECT id, username, display_name FROM teachers WHERE role = 'parent'") as any[];
  console.log('\n家长账号:');
  parents.forEach((p: any) => console.log(`  ${p.username} (${p.display_name})`));

  console.log('\n=== 开始创建测试数据 ===\n');

  // 步骤1: 创建/查找测试教师
  let testTeacher = db.get("SELECT id, display_name FROM teachers WHERE username = ?", ['test_teacher@test.com']) as any;
  if (!testTeacher) {
    const hashedPassword = bcrypt.hashSync('123456', 10);
    const teacherId = crypto.randomUUID();
    db.run(
      "INSERT INTO teachers (id, username, password_hash, display_name, role, school, login_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [teacherId, 'test_teacher@test.com', hashedPassword, '测试教师王老师', 'teacher', '测试小学', 'email']
    );
    testTeacher = { id: teacherId, display_name: '测试教师王老师' };
    console.log('✓ 创建测试教师: test_teacher@test.com / 123456');
  } else {
    db.run("UPDATE teachers SET role = 'teacher' WHERE id = ?", [testTeacher.id]);
    console.log('→ 测试教师已存在:', testTeacher.display_name);
  }

  const tid = testTeacher.id;

  // 步骤2: 删除该教师下的旧数据
  const oldClasses = db.all("SELECT id FROM classes WHERE teacher_id = ?", [tid]) as any[];
  for (const c of oldClasses) {
    const oldStudents = db.all("SELECT id FROM students WHERE class_id = ?", [c.id]) as any[];
    for (const s of oldStudents) {
      db.run("DELETE FROM student_pets WHERE student_id = ?", [s.id]);
      db.run("DELETE FROM point_records WHERE student_id = ?", [s.id]);
      db.run("DELETE FROM parent_students WHERE student_id = ?", [s.id]);
      db.run("DELETE FROM join_requests WHERE student_id = ?", [s.id]);
    }
    db.run("DELETE FROM students WHERE class_id = ?", [c.id]);
    db.run("DELETE FROM class_promotions WHERE class_id = ?", [c.id]);
    db.run("DELETE FROM classes WHERE id = ?", [c.id]);
  }
  console.log('✓ 清理旧测试数据');

  // 步骤3: 创建2个班级
  const class1Id = crypto.randomUUID();
  const class2Id = crypto.randomUUID();
  const invite1 = 'T3ST' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const invite2 = 'T3ST' + Math.random().toString(36).substring(2, 6).toUpperCase();
  db.run(
    "INSERT INTO classes (id, name, grade, teacher_id, invite_code, is_archived) VALUES (?, ?, ?, ?, ?, 0)",
    [class1Id, '三年级一班', '三年级', tid, invite1]
  );
  db.run(
    "INSERT INTO classes (id, name, grade, teacher_id, invite_code, is_archived) VALUES (?, ?, ?, ?, ?, 0)",
    [class2Id, '四年级二班', '四年级', tid, invite2]
  );
  console.log(`✓ 创建班级: 三年级一班 (邀请码: ${invite1}), 四年级二班 (邀请码: ${invite2})`);

  // 步骤4: 每个班级创建10个学生
  const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴'];
  const givenNames = ['明', '华', '丽', '强', '伟', '芳', '敏', '静', '涛', '磊'];
  const class1Students: { id: string; name: string }[] = [];
  const class2Students: { id: string; name: string }[] = [];

  for (let i = 0; i < 10; i++) {
    const sid = crypto.randomUUID();
    const name = `${surnames[i]}${givenNames[i]}`;
    db.run(
      "INSERT INTO students (id, name, class_id, total_points, is_active) VALUES (?, ?, ?, 10000, 1)",
      [sid, name, class1Id]
    );
    class1Students.push({ id: sid, name });
  }
  for (let i = 0; i < 10; i++) {
    const sid = crypto.randomUUID();
    const name = `${surnames[9-i]}${givenNames[(i+5)%10]}`;
    db.run(
      "INSERT INTO students (id, name, class_id, total_points, is_active) VALUES (?, ?, ?, 10000, 1)",
      [sid, name, class2Id]
    );
    class2Students.push({ id: sid, name });
  }
  console.log(`✓ 三年级一班: ${class1Students.length}名学生`);
  console.log(`✓ 四年级二班: ${class2Students.length}名学生`);

  // 步骤5: 为每个学生领养5只宠物 (1传说 + 1史诗 + 1稀有 + 2不同普通)
  const legendaryPets = db.all("SELECT id, name, rarity FROM pets WHERE rarity = 'legendary'") as any[];
  const epicPets = db.all("SELECT id, name, rarity FROM pets WHERE rarity = 'epic'") as any[];
  const rarePets = db.all("SELECT id, name, rarity FROM pets WHERE rarity = 'rare'") as any[];
  const commonPets = db.all("SELECT id, name, rarity FROM pets WHERE rarity = 'common'") as any[];

  console.log(`\n宠物池: 传说${legendaryPets.length}, 史诗${epicPets.length}, 稀有${rarePets.length}, 普通${commonPets.length}`);

  // 不同喂养等级对应的经验值，让测试更丰富
  const expLevels = [0, 50, 100, 200, 300, 450, 600, 800, 1000, 1200, 1500, 2000, 2500, 3200, 4000, 5000];

  const allStudents = [...class1Students, ...class2Students];
  let totalPets = 0;

  for (let si = 0; si < allStudents.length; si++) {
    const student = allStudents[si];
    // 每人5只: 传说,史诗,稀有,普通1,普通2 (都用不同species所以UNIQUE约束不冲突)
    const petAssignments = [
      legendaryPets[si % legendaryPets.length],
      epicPets[si % epicPets.length],
      rarePets[si % rarePets.length],
      commonPets[si % commonPets.length],           // 普通1
      commonPets[(si + 1) % commonPets.length],     // 普通2 (不同species)
    ];

    const nicknames = ['闪耀之星', '雷霆战将', '智慧精灵', '阳光宝贝', '快乐伙伴'];

    for (let pi = 0; pi < petAssignments.length; pi++) {
      const pet = petAssignments[pi];
      // 不同稀有度给不同经验值范围，传说高、普通低
      let exp: number;
      if (pet.rarity === 'legendary') exp = expLevels[8 + (si % 8)];   // 1000-5000
      else if (pet.rarity === 'epic') exp = expLevels[5 + (si % 8)];    // 450-3200
      else if (pet.rarity === 'rare') exp = expLevels[3 + (si % 8)];    // 300-2500
      else exp = expLevels[si % 10];                                    // 0-1200

      db.run(
        "INSERT INTO student_pets (id, student_id, pet_id, nickname, current_exp, status, is_active) VALUES (?, ?, ?, ?, ?, 'alive', 1)",
        [crypto.randomUUID(), student.id, pet.id, nicknames[pi], exp]
      );
      totalPets++;
    }
  }
  console.log(`✓ 为${allStudents.length}名学生各领养5只宠物 (共${totalPets}只)`);

  // 步骤6: 添加积分记录
  for (const student of allStudents) {
    db.run(
      "INSERT INTO point_records (id, student_id, teacher_id, points_change, reason, category, created_at) VALUES (?, ?, ?, 10000, '初始积分（测试数据）', 'bonus', ?)",
      [crypto.randomUUID(), student.id, tid, new Date().toISOString()]
    );
  }
  console.log('✓ 添加积分记录');

  // 步骤7: 创建测试家长账号
  let testParent = db.get("SELECT id, display_name FROM teachers WHERE username = ?", ['test_parent@test.com']) as any;
  if (!testParent) {
    const hashedPassword = bcrypt.hashSync('123456', 10);
    const parentId = crypto.randomUUID();
    db.run(
      "INSERT INTO teachers (id, username, password_hash, display_name, role, school, login_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [parentId, 'test_parent@test.com', hashedPassword, '测试家长李妈妈', 'parent', '测试小学', 'email']
    );
    // 关联到三年级一班的第一个学生
    db.run(
      "INSERT INTO parent_students (id, parent_id, student_id) VALUES (?, ?, ?)",
      [crypto.randomUUID(), parentId, class1Students[0].id]
    );
    console.log(`✓ 创建测试家长: test_parent@test.com / 123456 (关联: ${class1Students[0].name})`);
  } else {
    const linkCount = db.get("SELECT COUNT(*) as cnt FROM parent_students WHERE parent_id = ?", [testParent.id]) as any;
    if (linkCount.cnt === 0 && class1Students.length > 0) {
      db.run(
        "INSERT INTO parent_students (id, parent_id, student_id) VALUES (?, ?, ?)",
        [crypto.randomUUID(), testParent.id, class1Students[0].id]
      );
    }
    console.log('→ 测试家长已存在');
  }

  console.log('\n=== 测试数据准备完成 ===\n');
  console.log('账号汇总:');
  console.log('  管理员: 505694933@qq.com / 123456');
  console.log('  教师:   test_teacher@test.com / 123456  (2个班, 20名学生, 100只宠物)');
  console.log('  家长:   test_parent@test.com / 123456   (关联1名学生)');
  console.log('');
  console.log('每名学生: 5只宠物 (传说+史诗+稀有+2普通), 积分10000, 不同喂养等级');

  // 验证
  const vfyStudents = db.get(
    "SELECT COUNT(*) as cnt FROM students s JOIN classes c ON s.class_id = c.id WHERE c.teacher_id = ? AND s.is_active = 1",
    [tid]
  ) as any;
  const vfyPets = db.get(
    `SELECT COUNT(*) as cnt FROM student_pets sp
     JOIN students s ON sp.student_id = s.id
     JOIN classes c ON s.class_id = c.id
     WHERE c.teacher_id = ? AND sp.is_active = 1`,
    [tid]
  ) as any;
  console.log(`\n验证: ${vfyStudents.cnt}名学生, ${vfyPets.cnt}只宠物`);

  // 各班级宠物分布
  for (const cls of [{ id: class1Id, name: '三年级一班' }, { id: class2Id, name: '四年级二班' }]) {
    const dist = db.all(
      `SELECT p.rarity, COUNT(*) as cnt FROM student_pets sp
       JOIN students s ON sp.student_id = s.id
       JOIN pets p ON sp.pet_id = p.id
       WHERE s.class_id = ? GROUP BY p.rarity ORDER BY p.rarity`,
      [cls.id]
    ) as any[];
    console.log(`  ${cls.name}: ${dist.map((d: any) => `${d.rarity}:${d.cnt}`).join(', ')}`);
  }

  process.exit(0);
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
