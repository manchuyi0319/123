import jwt from 'jsonwebtoken';
import { config } from '../config';

export function signToken(teacherId: string): string {
  return jwt.sign({ teacherId }, config.jwtSecret, { expiresIn: '24h' });
}

export function verifyToken(token: string): { teacherId: string } {
  return jwt.verify(token, config.jwtSecret) as { teacherId: string };
}
