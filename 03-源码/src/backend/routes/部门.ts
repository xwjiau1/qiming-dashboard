import { Router } from 'express';
import { db } from '../database/数据库.ts';
import { keysToCamelCase, successResponse } from '../utils/serializer.ts';

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM departments ORDER BY created_at').all() as any[];
  const departments = rows.map((d) => {
    const head = db.prepare('SELECT * FROM agents WHERE id = ?').get(d.head_id) as any;
    const projects = db.prepare(
      'SELECT p.* FROM projects p JOIN project_departments pd ON p.id = pd.project_id WHERE pd.department_id = ? ORDER BY p.created_at DESC'
    ).all(d.id) as any[];

    const dept = keysToCamelCase(d);
    delete (dept as any).headId;

    return {
      ...dept,
      head: head ? {
        ...keysToCamelCase(head),
        abilities: head.abilities ? JSON.parse(head.abilities) : [],
        story: { summary: head.story_summary || '', full: head.story_full || '' },
      } : null,
      projects: projects.map((p) => p.name),
    };
  });
  res.json(successResponse(departments));
});

export default router;
