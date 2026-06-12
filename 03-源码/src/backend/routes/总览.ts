import { Router } from 'express';
import { db } from '../database/数据库.ts';

const router = Router();

router.get('/', (req, res) => {
  // KPI 聚合
  const totalProjects = (db.prepare('SELECT COUNT(*) as c FROM projects').get() as any).c;
  const inProgress = (db.prepare("SELECT COUNT(*) as c FROM projects WHERE status = 'in-progress'").get() as any).c;
  const completed = (db.prepare("SELECT COUNT(*) as c FROM projects WHERE status = 'completed'").get() as any).c;
  const pending = (db.prepare("SELECT COUNT(*) as c FROM projects WHERE status = 'planning'").get() as any).c;
  const totalTasks = (db.prepare('SELECT COUNT(*) as c FROM tasks').get() as any).c;
  const completedTasks = (db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status = 'completed'").get() as any).c;
  const inProgressTasks = (db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status = 'in-progress'").get() as any).c;
  const pendingTasks = (db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status = 'todo'").get() as any).c;

  // 部门列表（含负责人）
  const deptRows = db.prepare('SELECT * FROM departments ORDER BY created_at').all() as any[];
  const departments = deptRows.map((d) => {
    const head = db.prepare('SELECT * FROM agents WHERE id = ?').get(d.head_id) as any;
    const projects = db.prepare(
      'SELECT p.* FROM projects p JOIN project_departments pd ON p.id = pd.project_id WHERE pd.department_id = ? ORDER BY p.created_at DESC'
    ).all(d.id) as any[];
    return {
      ...d,
      shortName: d.short_name,
      colorHex: d.color_hex,
      memberCount: d.member_count,
      head: head ? {
        ...head,
        abilities: head.abilities ? JSON.parse(head.abilities) : [],
        colorTheme: head.color_theme,
        story: { summary: head.story_summary || '', full: head.story_full || '' },
      } : null,
      projects: projects.map((p) => p.name),
    };
  });

  // 项目列表（非已完成的前3个）
  const projectRows = db.prepare("SELECT * FROM projects WHERE status != 'completed' ORDER BY updated_at_ts DESC LIMIT 3").all() as any[];
  const projects = projectRows.map((row) => {
    const cycles = db.prepare('SELECT * FROM project_cycles WHERE project_id = ? ORDER BY "order"').all(row.id) as any[];
    const workflow = db.prepare('SELECT * FROM workflow_nodes WHERE project_id = ? ORDER BY "order"').all(row.id) as any[];
    const involved = db.prepare(
      'SELECT d.name FROM departments d JOIN project_departments pd ON d.id = pd.department_id WHERE pd.project_id = ?'
    ).all(row.id) as any[];
    return {
      ...row,
      involvedDepartments: involved.map((d) => d.name),
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
  });

  // 活跃任务前5
  const taskRows = db.prepare(
    "SELECT * FROM tasks WHERE status IN ('todo','in-progress','review') ORDER BY updated_at DESC LIMIT 5"
  ).all() as any[];

  // 最近动态6条
  const activities = db.prepare('SELECT * FROM activities ORDER BY created_at DESC LIMIT 6').all() as any[];

  res.json({
    success: true,
    data: {
      kpi: { totalProjects, inProgress, completed, pending, totalTasks, completedTasks, inProgressTasks, pendingTasks },
      departments,
      projects,
      tasks: taskRows,
      activities,
    },
  });
});

export default router;
