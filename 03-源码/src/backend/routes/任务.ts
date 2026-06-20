import { Router } from 'express';
import { db } from '../database/数据库.ts';
import { recordTaskActivity } from '../middleware/动态记录.ts';
import { keysToCamelCase, successResponse, errorResponse } from '../utils/serializer.ts';

const router = Router();

router.get('/', (req, res) => {
  const { projectId, status, priority, department, assignee, search } = req.query as Record<string, string>;

  let sql = 'SELECT * FROM tasks WHERE 1=1';
  const params: any[] = [];

  if (projectId) { sql += ' AND project_id = ?'; params.push(projectId); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (priority) { sql += ' AND priority = ?'; params.push(priority); }
  if (department) { sql += ' AND department = ?'; params.push(department); }
  if (assignee) { sql += ' AND assignee_id = ?'; params.push(assignee); }
  if (search) { sql += ' AND title LIKE ?'; params.push(`%${search}%`); }
  sql += ' ORDER BY updated_at DESC';

  const rows = db.prepare(sql).all(...params) as any[];
  res.json(successResponse(rows.map((row) => {
    const task = keysToCamelCase(row);
    delete (task as any).assigneeId; // 前端只需要 assignee/assigneeAvatar/assigneeRole
    return task;
  })));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) as any;
  if (!row) return res.status(404).json(errorResponse('任务不存在'));
  const task = keysToCamelCase(row);
  delete (task as any).assigneeId;
  res.json(successResponse(task));
});

router.post('/', (req, res) => {
  const { title, priority = 'medium', status = 'todo', projectId, department, type = '任务', assigneeId, dueDate, description } = req.body;
  const now = Date.now();
  const id = 't' + now;

  const project = db.prepare('SELECT name FROM projects WHERE id = ?').get(projectId) as any;
  const assignee = db.prepare('SELECT name, avatar, role FROM agents WHERE id = ?').get(assigneeId) as any;

  const stmt = db.prepare(`
    INSERT INTO tasks (id, title, priority, status, project_id, project_name, department, department_color, type, assignee_id, assignee_name, assignee_avatar, assignee_role, due_date, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const deptColor = department === '技术部' ? 'blue' : department === '设计部' ? 'gold' : 'blue';
  stmt.run(
    id, title, priority, status, projectId, project?.name || '', department, deptColor,
    type, assigneeId || null, assignee?.name || '', assignee?.avatar || '', assignee?.role || '',
    dueDate, description || '', now, now
  );

  recordTaskActivity('创建了任务', title, id, deptColor);
  res.json(successResponse({ id }));
});

router.patch('/:id', (req, res) => {
  const { status, priority, assigneeId } = req.body;
  const now = Date.now();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) as any;
  if (!task) return res.status(404).json(errorResponse('任务不存在'));

  const updates: string[] = [];
  const params: any[] = [];

  if (status !== undefined) { updates.push('status = ?'); params.push(status); }
  if (priority !== undefined) { updates.push('priority = ?'); params.push(priority); }
  if (assigneeId !== undefined) {
    const assignee = db.prepare('SELECT name, avatar, role FROM agents WHERE id = ?').get(assigneeId) as any;
    updates.push('assignee_id = ?'); params.push(assigneeId);
    updates.push('assignee_name = ?'); params.push(assignee?.name || '');
    updates.push('assignee_avatar = ?'); params.push(assignee?.avatar || '');
    updates.push('assignee_role = ?'); params.push(assignee?.role || '');
  }
  updates.push('updated_at = ?'); params.push(now);
  params.push(req.params.id);

  const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
  db.prepare(sql).run(...params);

  if (status) {
    const action = status === 'completed' ? '完成了任务' : status === 'in-progress' ? '开始处理任务' : '更新了任务状态';
    recordTaskActivity(action, task.title, task.id, task.department_color || 'blue');
  }

  res.json(successResponse({ id: req.params.id }));
});

router.put('/:id', (req, res) => {
  const { title, priority, status, projectId, department, assigneeId, dueDate, description } = req.body;
  const now = Date.now();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) as any;
  if (!task) return res.status(404).json(errorResponse('任务不存在'));

  const project = db.prepare('SELECT name FROM projects WHERE id = ?').get(projectId) as any;
  const assignee = db.prepare('SELECT name, avatar, role FROM agents WHERE id = ?').get(assigneeId) as any;
  const deptColor = department === '技术部' ? 'blue' : department === '设计部' ? 'gold' : 'blue';

  db.prepare(`
    UPDATE tasks SET
      title = ?, priority = ?, status = ?, project_id = ?, project_name = ?,
      department = ?, department_color = ?, assignee_id = ?, assignee_name = ?,
      assignee_avatar = ?, assignee_role = ?, due_date = ?, description = ?, updated_at = ?
    WHERE id = ?
  `).run(
    title, priority, status, projectId, project?.name || '',
    department, deptColor, assigneeId || null, assignee?.name || '',
    assignee?.avatar || '', assignee?.role || '', dueDate, description || '', now, req.params.id
  );

  recordTaskActivity('更新了任务', title, req.params.id, deptColor);
  res.json(successResponse({ id: req.params.id }));
});

router.delete('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id) as any;
  if (!task) return res.status(404).json(errorResponse('任务不存在'));
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  recordTaskActivity('删除了任务', task.title, task.id, task.department_color || 'blue');
  res.json(successResponse({ id: req.params.id }));
});

export default router;
