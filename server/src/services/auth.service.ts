import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { teacherRepo } from '../repositories/teacher.repo';
import { signToken } from '../utils/jwt';
import { ValidationError, ConflictError, UnauthorizedError } from '../utils/errors';
import type { AuthResponse, Teacher } from 'shared';

export const authService = {
  register(email: string, password: string, displayName: string): AuthResponse {
    if (password.length < 4) {
      throw new ValidationError('密码长度不能少于4位');
    }

    const existing = teacherRepo.findByEmail(email);
    if (existing) {
      throw new ConflictError('该邮箱已注册');
    }

    const passwordHash = bcrypt.hashSync(password, 12);
    const id = crypto.randomUUID();
    const teacher = teacherRepo.create(id, email, passwordHash, displayName);
    const token = signToken(id, teacher.role);

    return { token, teacher };
  },

  login(email: string, password: string): AuthResponse {
    const row = teacherRepo.findByEmail(email);
    if (!row) {
      throw new UnauthorizedError('邮箱或密码错误');
    }

    const valid = bcrypt.compareSync(password, row.password_hash);
    if (!valid) {
      throw new UnauthorizedError('邮箱或密码错误');
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

  updateProfile(teacherId: string, data: Partial<Teacher>): Teacher {
    teacherRepo.updateProfile(teacherId, data);
    const teacher = teacherRepo.findById(teacherId);
    if (!teacher) {
      throw new UnauthorizedError('用户不存在');
    }
    return teacher;
  },

  changePassword(teacherId: string, oldPassword: string, newPassword: string): void {
    const row = teacherRepo.findByIdWithPassword(teacherId);
    if (!row) {
      throw new UnauthorizedError('用户不存在');
    }

    const valid = bcrypt.compareSync(oldPassword, row.password_hash);
    if (!valid) {
      throw new ValidationError('旧密码不正确');
    }

    const newHash = bcrypt.hashSync(newPassword, 12);
    teacherRepo.updatePassword(teacherId, newHash);
  },
};
