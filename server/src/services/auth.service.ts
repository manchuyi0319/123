import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { teacherRepo } from '../repositories/teacher.repo';
import { signToken } from '../utils/jwt';
import { ValidationError, ConflictError, UnauthorizedError } from '../utils/errors';
import type { AuthResponse, Teacher } from 'shared';

export const authService = {
  register(username: string, password: string, displayName: string): AuthResponse {
    if (password.length < 4) {
      throw new ValidationError('密码长度不能少于4位');
    }

    const existing = teacherRepo.findByUsername(username);
    if (existing) {
      throw new ConflictError('用户名已存在');
    }

    const passwordHash = bcrypt.hashSync(password, 12);
    const id = crypto.randomUUID();
    const teacher = teacherRepo.create(id, username, passwordHash, displayName);
    const token = signToken(id, teacher.role);

    return { token, teacher };
  },

  login(username: string, password: string): AuthResponse {
    const row = teacherRepo.findByUsername(username);
    if (!row) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    const valid = bcrypt.compareSync(password, row.password_hash);
    if (!valid) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    const token = signToken(row.id, row.role);
    const { password_hash, updated_at, ...teacher } = row;
    return { token, teacher };
  },

  getMe(teacherId: string): Teacher {
    const teacher = teacherRepo.findById(teacherId);
    if (!teacher) {
      throw new UnauthorizedError('用户不存在');
    }
    return teacher;
  },
};
