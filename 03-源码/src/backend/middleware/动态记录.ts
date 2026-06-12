import { db } from '../database/数据库.ts';

/**
 * 动态记录中间件：在 POST/PATCH 操作后自动插入 activities 表
 * 使用方式：在路由中调用 recordActivity(userName, action, target, targetType, color)
 */
export function recordActivity(
  userName: string,
  userAvatar: string,
  action: string,
  target: string,
  targetId: string | null,
  targetType: string,
  color: 'blue' | 'gold' = 'blue'
) {
  const now = Date.now();
  const id = 'a' + now;
  const timestamp = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  const stmt = db.prepare(`
    INSERT INTO activities (id, user_name, user_avatar, action, target, target_id, target_type, timestamp, color, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, userName, userAvatar, action, target, targetId, targetType, timestamp, color, now);
}

/**
 * 记录项目相关动态
 */
export function recordProjectActivity(action: string, projectName: string, projectId: string, color: 'blue' | 'gold' = 'blue') {
  recordActivity('系统', '', action, projectName, projectId, 'project', color);
}

/**
 * 记录任务相关动态
 */
export function recordTaskActivity(action: string, taskTitle: string, taskId: string, color: 'blue' | 'gold' = 'blue') {
  recordActivity('系统', '', action, taskTitle, taskId, 'task', color);
}

/**
 * 记录文档相关动态
 */
export function recordDocActivity(action: string, docName: string, docId: string, color: 'blue' | 'gold' = 'blue') {
  recordActivity('系统', '', action, docName, docId, 'document', color);
}
