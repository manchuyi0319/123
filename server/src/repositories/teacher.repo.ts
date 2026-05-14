import { getDb } from '../database/connection';
import type { Teacher } from 'shared';

export interface TeacherRow extends Teacher {
  password_hash: string;
  updated_at: string;
}

export const teacherRepo = {
  findByUsername(username: string): TeacherRow | undefined {
    return getDb().get('SELECT * FROM teachers WHERE username = ?', [username]) as TeacherRow | undefined;
  },

  findById(id: string): Teacher | undefined {
    return getDb().get('SELECT id, username, display_name, avatar_url, role, created_at FROM teachers WHERE id = ?', [id]) as Teacher | undefined;
  },

  create(id: string, username: string, passwordHash: string, displayName: string): Teacher {
    getDb().run(
      'INSERT INTO teachers (id, username, password_hash, display_name) VALUES (?, ?, ?, ?)',
      [id, username, passwordHash, displayName]
    );
    return this.findById(id)!;
  },

  findAll(): TeacherRow[] {
    return getDb().all(
      `SELECT t.*,
        (SELECT COUNT(*) FROM classes WHERE teacher_id = t.id AND is_archived = 0) as class_count,
        (SELECT COUNT(*) FROM students s JOIN classes c ON s.class_id = c.id WHERE c.teacher_id = t.id AND s.is_active = 1) as student_count
       FROM teachers t ORDER BY t.created_at DESC`
    );
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
