import { Router } from 'express';
import { db } from '../database/数据库.ts';
import { recordDocActivity } from '../middleware/动态记录.ts';
import { keysToCamelCase, successResponse, errorResponse } from '../utils/serializer.ts';

const router = Router();

router.get('/', (req, res) => {
  const { type, status, search } = req.query as Record<string, string>;

  let sql = 'SELECT * FROM documents WHERE 1=1';
  const params: any[] = [];

  if (type) { sql += ' AND type = ?'; params.push(type); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (search) { sql += ' AND name LIKE ?'; params.push(`%${search}%`); }
  sql += ' ORDER BY updated_at_ts DESC';

  const rows = db.prepare(sql).all(...params) as any[];
  res.json(successResponse(rows.map((row) => {
    const doc = keysToCamelCase(row);
    delete (doc as any).updatedById; // 前端只需要 updatedBy
    delete (doc as any).updatedAtTs; // 前端只需要 updatedAt
    delete (doc as any).updatedAtMeta; // 内部字段
    delete (doc as any).content; // 暂不返回内容
    return doc;
  })));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id) as any;
  if (!row) return res.status(404).json(errorResponse('文档不存在'));
  const doc = keysToCamelCase(row);
  delete (doc as any).updatedById;
  delete (doc as any).updatedAtTs;
  delete (doc as any).updatedAtMeta;
  res.json(successResponse(doc));
});

router.post('/', (req, res) => {
  const { name, type = 'technical', department, status = 'draft' } = req.body;
  const now = Date.now();
  const id = 'd' + now;

  const deptColor = department === '技术部' ? 'blue' : department === '设计部' ? 'gold' : 'blue';
  const stmt = db.prepare(`
    INSERT INTO documents (id, name, type, department, department_color, updated_by_name, updated_at, updated_at_ts, status, created_at, updated_at_meta)
    VALUES (?, ?, ?, ?, ?, '系统', '刚刚', ?, ?, ?, ?)
  `);
  stmt.run(id, name, type, department, deptColor, now, status, now, now);

  recordDocActivity('创建了文档', name, id, deptColor);
  res.json(successResponse({ id }));
});

export default router;