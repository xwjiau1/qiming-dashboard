import { Router } from 'express';
import { db } from '../database/数据库.ts';
import { recordProjectActivity } from '../middleware/动态记录.ts';

const router = Router();

function enrichProject(row: any) {
  const cycles = db.prepare('SELECT * FROM project_cycles WHERE project_id = ? ORDER BY "order"').all(row.id) as any[];
  const workflow = db.prepare('SELECT * FROM workflow_nodes WHERE project_id = ? ORDER BY "order"').all(row.id) as any[];
  const departments = db.prepare(
    'SELECT d.name FROM departments d JOIN project_departments pd ON d.id = pd.department_id WHERE pd.project_id = ?'
  ).all(row.id) as any[];

  return {
    ...row,
    involvedDepartments: departments.map((d) => d.name),
    cycles: cycles.map((c) => ({ 
      id: c.id, 
      name: c.name, 
      description: c.description, 
      startDate: c.start_date, 
      endDate: c.end_date, 
      status: c.status, 
      color: c.color, 
      order: c['order'] 
    })),
    workflow: workflow.map((w) => ({
      id: w.id,
      agentId: w.agent_id,
      agentName: w.agent_name,
      agentAvatar: w.agent_avatar,
      agentRole: w.agent_role,
      department: w.department,
      departmentColor: w.department_color,
      order: w['order'],
      responsibility: w.responsibility,
    })),
    lead: row.lead_name,
    leadAvatar: row.lead_avatar,
    leadRole: row.lead_role,
    startDate: row.start_date,
    completedTasks: row.completed_tasks,
    taskCount: row.task_count,
    updatedAt: row.updated_at,
  };
}

router.get('/', (req, res) => {
  const { status = 'all', search = '', department = '' } = req.query as Record<string, string>;

  let sql = 'SELECT * FROM projects WHERE 1=1';
  const params: any[] = [];

  if (status !== 'all') {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    sql += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }
  if (department) {
    sql += ' AND id IN (SELECT project_id FROM project_departments pd JOIN departments d ON pd.department_id = d.id WHERE d.name = ?)';
    params.push(department);
  }
  sql += ' ORDER BY updated_at_ts DESC';

  const rows = db.prepare(sql).all(...params) as any[];
  const projects = rows.map(enrichProject);
  res.json({ success: true, data: projects });
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as any;
  if (!row) return res.status(404).json({ success: false, error: '项目不存在' });
  res.json({ success: true, data: enrichProject(row) });
});

router.post('/', (req, res) => {
  const { name, description, status = 'planning', involvedDepartments = [], deadline, startDate } = req.body;
  const now = Date.now();
  const id = 'p' + now;

  const stmt = db.prepare(`
    INSERT INTO projects (id, name, description, status, progress, lead_name, lead_role, deadline, start_date, task_count, completed_tasks, updated_at, created_at, updated_at_ts)
    VALUES (?, ?, ?, ?, 0, 'Wenner', 'CEO', ?, ?, 0, 0, '刚刚', ?, ?)
  `);
  stmt.run(id, name, description, status, deadline, startDate, now, now);

  // 关联部门
  const insertPD = db.prepare('INSERT INTO project_departments (project_id, department_id) VALUES (?, ?)');
  for (const deptName of involvedDepartments) {
    const dept = db.prepare('SELECT id FROM departments WHERE name = ?').get(deptName) as any;
    if (dept) insertPD.run(id, dept.id);
  }

  recordProjectActivity('创建了项目', name, id, 'blue');
  res.json({ success: true, data: { id } });
});

export default router;
