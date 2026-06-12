import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initSchema } from './database/建表.ts';
import { seedData } from './database/种子数据.ts';

import 智能体路由 from './routes/智能体.ts';
import 部门路由 from './routes/部门.ts';
import 项目路由 from './routes/项目.ts';
import 任务路由 from './routes/任务.ts';
import 文档路由 from './routes/文档.ts';
import 动态路由 from './routes/动态.ts';
import 总览路由 from './routes/总览.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// 初始化数据库
initSchema();
seedData();

// API 路由
app.use('/api/agents', 智能体路由);
app.use('/api/departments', 部门路由);
app.use('/api/projects', 项目路由);
app.use('/api/tasks', 任务路由);
app.use('/api/documents', 文档路由);
app.use('/api/activities', 动态路由);
app.use('/api/dashboard', 总览路由);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { version: '1.0.0', status: 'ok' } });
});

// 静态文件：前端构建产物
const staticPath = path.resolve(__dirname, '../../dist/public');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
} else {
  console.warn('[警告] 前端构建产物目录不存在:', staticPath);
}

// SPA fallback：所有非 API 路由返回 index.html
app.use((req, res) => {
  const indexPath = path.resolve(__dirname, '../../dist/public/index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Content-Type', 'text/html');
    const content = fs.readFileSync(indexPath, 'utf-8');
    return res.send(content);
  }
  res.status(404).send('未找到前端构建产物，请先运行 npm run build');
});

app.listen(PORT, () => {
  console.log(`[服务] 已启动: http://localhost:${PORT}`);
});
