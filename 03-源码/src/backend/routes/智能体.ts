import { Router } from 'express';
import { db } from '../database/数据库.ts';
import { successResponse, errorResponse } from '../utils/serializer.ts';

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM agents ORDER BY created_at').all();
  const agents = rows.map((a: any) => ({
    ...successResponse(a).data,
    abilities: a.abilities ? JSON.parse(a.abilities) : [],
    story: { summary: a.story_summary || '', full: a.story_full || '' },
  }));
  res.json(successResponse(agents));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM agents WHERE id = ?').get(req.params.id) as any;
  if (!row) return res.status(404).json(errorResponse('智能体不存在'));
  const agent = {
    ...successResponse(row).data,
    abilities: row.abilities ? JSON.parse(row.abilities) : [],
    story: { summary: row.story_summary || '', full: row.story_full || '' },
  };
  res.json(successResponse(agent));
});

export default router;
