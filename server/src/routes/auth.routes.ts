import { Router, Response } from 'express';
import { authService } from '../services/auth.service';
import { validate } from '../middleware/validate';
import { loginSchema, registerSchema, updateProfileSchema, changePasswordSchema } from '../validators/auth.validator';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', validate(registerSchema), (req: AuthRequest, res: Response) => {
  const { email, password, display_name } = req.body;
  const result = authService.register(email, password, display_name);
  res.status(201).json(result);
});

router.post('/login', validate(loginSchema), (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  const result = authService.login(email, password);
  res.json(result);
});

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const teacher = authService.getMe(req.teacherId!);
  res.json({ teacher });
});

router.patch('/profile', authMiddleware, validate(updateProfileSchema), (req: AuthRequest, res: Response) => {
  const teacher = authService.updateProfile(req.teacherId!, req.body);
  res.json({ teacher });
});

router.patch('/password', authMiddleware, validate(changePasswordSchema), (req: AuthRequest, res: Response) => {
  const { old_password, new_password } = req.body;
  authService.changePassword(req.teacherId!, old_password, new_password);
  res.json({ success: true });
});

export default router;
