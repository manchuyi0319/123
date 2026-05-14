import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  teacherId?: string;
  teacherRole?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: '请先登录' });
    return;
  }

  try {
    const payload = verifyToken(authHeader.slice(7));
    req.teacherId = payload.teacherId;
    req.teacherRole = payload.role || 'teacher';
    next();
  } catch {
    res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}
