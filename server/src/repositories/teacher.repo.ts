import { getDb } from '../database/connection';
import type { Teacher } from 'shared';

export interface TeacherRow extends Teacher {
  password_hash: string;
  updated_at: string;
}

export const teacherRepo = {
  findByEmail(email: string): TeacherRow | undefined {
    return getDb().get('SELECT * FROM teachers WHERE username = ?', [email]) as TeacherRow | undefined;
  },

  findById(id: string): Teacher | undefined {
    return getDb().get('SELECT id, username, display_name, avatar_url, email, phone, bio, school, role, created_at FROM teachers WHERE id = ?', [id]) as Teacher | undefined;
  },

  findByIdWithPassword(id: string): TeacherRow | undefined {
    return getDb().get('SELECT * FROM teachers WHERE id = ?', [id]) as TeacherRow | undefined;
  },

  create(id: string, email: string, passwordHash: string, displayName: string): Teacher {
    getDb().run(
      'INSERT INTO teachers (id, username, password_hash, display_name) VALUES (?, ?, ?, ?)',
      [id, email, passwordHash, displayName]
    );
    return this.findById(id)!;
  },

  findAll(): TeacherRow[] {
    return getDb().all(
      `SELECT t.*,
        (SELECT COUNT(*) FROM classes WHERE teacher_id = t.id AND is_archived = 0) as class_count,
        (SELECT COUNT(*) FROM students s JOIN classes c ON s.class_id = c.id WHERE c.teacher_id = t.id AND s.is_active = 1) as student_count
       FROM teachers t WHERE t.username != '505694933@qq.com' ORDER BY t.created_at DESC`
    );
  },

  updateProfile(id: string, data: Record<string, unknown>): void {
    const db = getDb();
    const updates: string[] = [];
    const params: unknown[] = [];
    for (const key of ['display_name', 'email', 'phone', 'school', 'bio', 'avatar_url']) {
      if (data[key] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(data[key]);
      }
    }
    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      params.push(id);
      db.run(`UPDATE teachers SET ${updates.join(', ')} WHERE id = ?`, params);
    }
  },

  setRole(id: string, role: string): void {
    getDb().run("UPDATE teachers SET role = ?, updated_at = datetime('now') WHERE id = ?", [role, id]);
  },

  updatePassword(id: string, passwordHash: string): void {
    getDb().run("UPDATE teachers SET password_hash = ?, updated_at = datetime('now') WHERE id = ?", [passwordHash, id]);
  },

  deleteById(id: string): void {
    const db = getDb();
    // 级联删除：point_records → student_pets → students → classes → teacher
    db.run('DELETE FROM point_records WHERE teacher_id = ?', [id]);
    db.run(
      `DELETE FROM student_pets WHERE student_id IN (
        SELECT s.id FROM students s JOIN classes c ON s.class_id = c.id WHERE c.teacher_id = ?
      )`,
      [id]
    );
    db.run(
      `DELETE FROM students WHERE class_id IN (
        SELECT id FROM classes WHERE teacher_id = ?
      )`,
      [id]
    );
    db.run('DELETE FROM evaluation_rules WHERE teacher_id = ? AND is_preset = 0', [id]);
    db.run('DELETE FROM classes WHERE teacher_id = ?', [id]);
    db.run('DELETE FROM teachers WHERE id = ?', [id]);
  },
};
