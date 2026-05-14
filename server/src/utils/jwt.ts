import jwt from 'jsonwebtoken';
import { config } from '../config';

export function signToken(teacherId: string, role: string = 'teacher'): string {
  return jwt.sign({ teacherId, role }, config.jwtSecret, { expiresIn: '24h' });
}

export function verifyToken(token: string): { teacherId: string; role: string } {
  return jwt.verify(token, config.jwtSecret) as { teacherId: string; role: string };
}
