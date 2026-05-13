import { Router, Response } from 'express';
import { authService } from '../services/auth.service';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', validate(registerSchema), (req: AuthRequest, res: Response) => {
  const { username, password, display_name } = req.body;
  const result = authService.register(username, password, display_name);
  res.status(201).json(result);
});

router.post('/login', validate(loginSchema), (req: AuthRequest, res: Response) => {
  const { username, password } = req.body;
  const result = authService.login(username, password);
  res.json(result);
});

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const teacher = authService.getMe(req.teacherId!);
  res.json({ teacher });
});

export default router;
