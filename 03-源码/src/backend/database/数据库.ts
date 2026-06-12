import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 数据库文件路径：项目根目录下的 data/company.db
const dbPath = path.resolve(__dirname, '../../data/company.db');

// 确保目录存在
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

// 启用外键约束和 WAL 模式
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('[数据库] 已连接:', dbPath);
