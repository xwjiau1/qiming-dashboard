import { Router } from 'express';
import { db } from '../database/数据库.ts';
import { recordTaskActivity } from '../middleware/动态记录.ts';
import { keysToCamelCase, successResponse, errorResponse } from '../utils/serializer.ts';

const router = Router();

// 列表
router.get('/', (req, res) => {
  const { completed, priority } = req.query as Record<string, string>;
  let sql = 'SELECT * FROM todos WHERE 1=1';
  const params: any[] = [];
  if (completed !== undefined) { sql += ' AND completed = ?'; params.push(completed === '1' ? 1 : 0); }
  if (priority) { sql += ' AND priority = ?'; params.push(priority); }
  sql += ' ORDER BY completed ASC, updated_at DESC';
  const rows = db.prepare(sql).all(...params) as any[];
  res.json(successResponse(rows.map((row) => {
    const todo = keysToCamelCase(row);
    todo.completed = Boolean(todo.completed); // 转为布尔
    return todo;
  })));
});

// 详情
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id) as any;
  if (!row) return res.status(404).json(errorResponse('待办不存在'));
  const todo = keysToCamelCase(row);
  todo.completed = Boolean(todo.completed);
  res.json(successResponse(todo));
});

// 创建
router.post('/', (req, res) => {
  const { title, priority = 'medium', dueDate, assigneeId } = req.body;
  const now = Date.now();
  const id = 'td' + now;
  const assignee = db.prepare('SELECT name, avatar FROM agents WHERE id = ?').get(assigneeId) as any;
  db.prepare(`
    INSERT INTO todos (id, title, completed, priority, due_date, assignee_id, assignee_name, assignee_avatar, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, title, 0, priority, dueDate || '', assigneeId || null, assignee?.name || '', assignee?.avatar || '', now, now
  );
  recordTaskActivity('创建了待办', title, id, 'blue');
  res.json(successResponse({ id }));
});

// 更新
router.put('/:id', (req, res) => {
  const { title, priority, dueDate, assigneeId } = req.body;
  const now = Date.now();
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id) as any;
  if (!todo) return res.status(404).json(errorResponse('待办不存在'));
  const assignee = db.prepare('SELECT name, avatar FROM agents WHERE id = ?').get(assigneeId) as any;
  db.prepare(`
    UPDATE todos SET title = ?, priority = ?, due_date = ?, assignee_id = ?, assignee_name = ?, assignee_avatar = ?, updated_at = ? WHERE id = ?
  `).run(
    title, priority, dueDate || '', assigneeId || null, assignee?.name || '', assignee?.avatar || '', now, req.params.id
  );
  recordTaskActivity('更新了待办', title, req.params.id, 'blue');
  res.json(successResponse({ id: req.params.id }));
});

// 切换完成状态
router.patch('/:id', (req, res) => {
  const { completed } = req.body;
  const now = Date.now();
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id) as any;
  if (!todo) return res.status(404).json(errorResponse('待办不存在'));
  db.prepare('UPDATE todos SET completed = ?, updated_at = ? WHERE id = ?').run(completed ? 1 : 0, now, req.params.id);
  const action = completed ? '完成了待办' : '标记待办为未完成';
  recordTaskActivity(action, todo.title, req.params.id, 'blue');
  res.json(successResponse({ id: req.params.id, completed: Boolean(completed) }));
});

// 删除
router.delete('/:id', (req, res) => {
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id) as any;
  if (!todo) return res.status(404).json(errorResponse('待办不存在'));
  db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
  recordTaskActivity('删除了待办', todo.title, req.params.id, 'blue');
  res.json(successResponse({ id: req.params.id }));
});

export default router;
