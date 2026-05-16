import { Router, Response } from 'express';
import { wechatAuthService } from '../services/wechat-auth.service';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 网站端微信扫码登录
router.post('/login-web', (req: AuthRequest, res: Response) => {
  const { code } = req.body;
  if (!code) {
    res.status(400).json({ error: '缺少微信授权码' });
    return;
  }
  wechatAuthService.webLogin(code)
    .then(result => res.json(result))
    .catch(err => res.status(401).json({ error: err.message || '微信登录失败' }));
});

// 小程序端微信登录
router.post('/login-mini', (req: AuthRequest, res: Response) => {
  const { code } = req.body;
  if (!code) {
    res.status(400).json({ error: '缺少微信登录码' });
    return;
  }
  wechatAuthService.miniLogin(code)
    .then(result => res.json(result))
    .catch(err => res.status(401).json({ error: err.message || '微信登录失败' }));
});

// 已登录用户绑定微信
router.post('/bind', authMiddleware, (req: AuthRequest, res: Response) => {
  const { unionid, nickname } = req.body;
  if (!unionid) {
    res.status(400).json({ error: '缺少微信 UnionID' });
    return;
  }
  const result = wechatAuthService.bindWechat(req.teacherId!, unionid, nickname || '微信用户');
  res.json(result);
});

// 检查微信绑定状态
router.get('/status', authMiddleware, (req: AuthRequest, res: Response) => {
  const result = wechatAuthService.getWechatStatus(req.teacherId!);
  res.json(result);
});

export default router;
