import { getDb } from '../database/connection';
import type { Teacher } from 'shared';

export const teacherRepo = {
  findByUsername(username: string): Teacher | undefined {
    return getDb().get('SELECT * FROM teachers WHERE username = ?', [username]) as Teacher | undefined;
  },

  findById(id: string): Teacher | undefined {
    return getDb().get('SELECT id, username, display_name, avatar_url, created_at FROM teachers WHERE id = ?', [id]) as Teacher | undefined;
  },

  create(id: string, username: string, passwordHash: string, displayName: string): Teacher {
    getDb().run(
      'INSERT INTO teachers (id, username, password_hash, display_name) VALUES (?, ?, ?, ?)',
      [id, username, passwordHash, displayName]
    );
    return this.findById(id)!;
  },
};
