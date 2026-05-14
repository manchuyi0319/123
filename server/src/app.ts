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

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    /\.vercel\.app$/,
  ],
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/rankings', rankingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/discover', discoverRoutes);

// 生产环境：托管前端静态文件
const distPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use(errorHandler);

export default app;
