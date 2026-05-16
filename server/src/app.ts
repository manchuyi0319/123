import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middleware/error-handler';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import classRoutes from './routes/class.routes';
import studentRoutes from './routes/student.routes';
import rulesRoutes from './routes/rules.routes';
import pointsRoutes from './routes/points.routes';
import petRoutes from './routes/pet.routes';
import rankingsRoutes from './routes/rankings.routes';
import adminRoutes from './routes/admin.routes';
import discoverRoutes from './routes/discover.routes';
import parentRoutes from './routes/parent.routes';
import joinRequestRoutes from './routes/join-request.routes';
import shopRoutes from './routes/shop.routes';
import rechargeCodeRoutes from './routes/recharge-code.routes';
import quizRoutes from './routes/quiz.routes';
import announcementRoutes from './routes/announcements.routes';
import bulletinRoutes from './routes/bulletin.routes';
import semesterRoutes from './routes/semester.routes';
import wechatAuthRoutes from './routes/wechat-auth.routes';

const app = express();

// CORS：开发环境 + 生产域名（通过环境变量 CORS_ORIGIN 配置）
const allowedOrigins: (string | RegExp)[] = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/auth/wechat', wechatAuthRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/rankings', rankingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/join-requests', joinRequestRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/recharge-codes', rechargeCodeRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/bulletin', bulletinRoutes);
app.use('/api/semester', semesterRoutes);

// 生产环境：托管前端静态文件
const distPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use(errorHandler);

export default app;
