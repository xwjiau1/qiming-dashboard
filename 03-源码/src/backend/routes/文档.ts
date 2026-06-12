import { Router } from 'express';
import { db } from '../database/数据库.ts';
import { recordDocActivity } from '../middleware/动态记录.ts';

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
  const documents = rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    department: row.department,
    departmentColor: row.department_color,
    updatedBy: row.updated_by_name,
    updatedByAvatar: row.updated_by_avatar,
    updatedAt: row.updated_at,
    status: row.status,
    createdAt: row.created_at,
  }));
  res.json({ success: true, data: documents });
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id) as any;
  if (!row) return res.status(404).json({ success: false, error: '文档不存在' });
  const doc = {
    id: row.id,
    name: row.name,
    type: row.type,
    department: row.department,
    departmentColor: row.department_color,
    updatedBy: row.updated_by_name,
    updatedByAvatar: row.updated_by_avatar,
    updatedAt: row.updated_at,
    status: row.status,
    createdAt: row.created_at,
  };
  res.json({ success: true, data: doc });
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
  res.json({ success: true, data: { id } });
});

export default router;
