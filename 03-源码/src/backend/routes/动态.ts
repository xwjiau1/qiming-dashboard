import { Router } from 'express';
import { db } from '../database/数据库.ts';
import { keysToCamelCase, successResponse } from '../utils/serializer.ts';

const router = Router();

router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const rows = db.prepare('SELECT * FROM activities ORDER BY created_at DESC LIMIT ?').all(limit) as any[];
  res.json(successResponse(rows.map((row) => keysToCamelCase(row))));
});

export default router;