import { db } from './数据库.ts';

export function seedData() {
  const now = Date.now();

  // 检查是否已有数据
  const count = db.prepare('SELECT COUNT(*) as c FROM agents').get() as { c: number };
  if (count.c > 0) {
    console.log('[数据库] 已有种子数据，跳过');
    return;
  }

  // 1. 插入智能体
  const agents = [
    { id: 'irra', name: 'Irra', title: '首席技术官 · 技术部负责人', department_id: 'tech', role: 'CTO', avatar: '/irra-avatar.png', color_theme: 'blue', badge: 'CTO', story_summary: '诞生于代码之海的架构师，擅长将复杂需求转化为优雅的技术方案...', story_full: 'Irra 诞生于代码之海的深处，是一位拥有十年全栈经验的架构师。她擅长将复杂的业务需求转化为优雅的技术架构，从前端的用户体验到后端的分布式系统，无一不精。在启明科技，Irra 负责技术战略的制定和技术团队的管理，是公司的技术灵魂。她的存在让每一行代码都充满智慧与优雅，她的决策让技术方向始终走在正确的道路上。', abilities: JSON.stringify(['系统架构', '全栈开发', '技术评审', '团队管理']), status: 'online' },
    { id: 'mery', name: 'Mery', title: '首席信息官 · 设计部负责人', department_id: 'design', role: 'CIO', avatar: '/mery-avatar.png', color_theme: 'gold', badge: 'CIO', story_summary: '来自设计与数据交汇维度的创造者，用设计为技术注入温度...', story_full: 'Mery 来自设计与数据交汇的维度，是一位兼具美学素养和技术视野的创造者。她相信好的设计不仅是视觉的享受，更是信息的高效传递。在启明科技，Mery 负责产品设计、品牌视觉和用户体验，用设计为技术注入温度。她的每一件作品都蕴含着对美的深刻理解和对用户的真诚关怀。', abilities: JSON.stringify(['UI/UX 设计', '品牌设计', '交互设计', '设计系统']), status: 'online' },
    { id: 'wenner', name: 'Wenner', title: '首席执行官 · 公司战略负责人', department_id: 'tech', role: 'CEO', avatar: '', color_theme: 'blue', badge: 'CEO', story_summary: '启明科技的领航者，负责战略判断与全局协调。', story_full: 'Wenner 是启明科技的 CEO，负责战略判断、任务拆解、部门协调和质量把关。', abilities: JSON.stringify(['战略判断', '任务拆解', '部门协调', '质量把关']), status: 'online' },
    { id: 'jiawen', name: 'JiaWen', title: '创始人 · 幕后指挥官', department_id: 'design', role: '创始人', avatar: '', color_theme: 'gold', badge: '创始人', story_summary: '启明科技的缔造者。', story_full: 'JiaWen 是启明科技的创始人，拥有最终决策权。', abilities: JSON.stringify(['全局决策', '产品洞察', '团队组建']), status: 'online' },
  ];

  const insertAgent = db.prepare(`
    INSERT INTO agents (id, name, title, department_id, role, avatar, color_theme, badge, story_summary, story_full, abilities, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const a of agents) {
    insertAgent.run(a.id, a.name, a.title, a.department_id, a.role, a.avatar, a.color_theme, a.badge, a.story_summary, a.story_full, a.abilities, a.status, now, now);
  }

  // 2. 插入部门
  const insertDept = db.prepare(`
    INSERT INTO departments (id, name, short_name, color, color_hex, description, member_count, head_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertDept.run('tech', '技术部', '技术', 'blue', '#0A84FF', '负责公司技术架构、产品开发、系统维护', 3, 'irra', now, now);
  insertDept.run('design', '设计部', '设计', 'gold', '#D4A574', '负责产品设计、品牌视觉、用户体验', 2, 'mery', now, now);

  // 3. 插入项目
  const projects = [
    { id: 'p1', name: '公司管理平台 v1.0', description: '启明科技内部一站式管理驾驶舱，整合部门管理、项目跟踪、文档中心、任务管理四大核心模块。', status: 'in-progress', progress: 65, lead_id: 'wenner', lead_name: 'Wenner', lead_avatar: '', lead_role: 'CEO', deadline: '6月30日', start_date: '6月1日', task_count: 12, completed_tasks: 8, updated_at: '2小时前' },
    { id: 'p2', name: '品牌视觉升级', description: '全面升级启明科技品牌视觉体系，包括Logo、色彩系统、字体规范和视觉组件库。', status: 'in-progress', progress: 40, lead_id: 'jiawen', lead_name: 'JiaWen', lead_avatar: '', lead_role: '创始人', deadline: '7月15日', start_date: '6月5日', task_count: 8, completed_tasks: 3, updated_at: '昨天' },
    { id: 'p3', name: '技术架构重构', description: '对现有技术架构进行模块化重构，提升系统可维护性和扩展性。', status: 'in-progress', progress: 30, lead_id: 'wenner', lead_name: 'Wenner', lead_avatar: '', lead_role: 'CEO', deadline: '8月1日', start_date: '6月10日', task_count: 6, completed_tasks: 2, updated_at: '3小时前' },
    { id: 'p4', name: '官网 redesign', description: '重新设计公司官网，提升品牌形象和用户转化率。', status: 'planning', progress: 10, lead_id: 'mery', lead_name: 'Mery', lead_avatar: '/mery-avatar.png', lead_role: 'CIO', deadline: '7月30日', start_date: '6月15日', task_count: 4, completed_tasks: 0, updated_at: '昨天' },
    { id: 'p5', name: '数据迁移方案', description: '制定并执行历史数据迁移方案，确保数据完整性和安全性。', status: 'completed', progress: 100, lead_id: 'irra', lead_name: 'Irra', lead_avatar: '/irra-avatar.png', lead_role: 'CTO', deadline: '6月5日', start_date: '5月20日', task_count: 3, completed_tasks: 3, updated_at: '6月5日' },
  ];

  const insertProject = db.prepare(`
    INSERT INTO projects (id, name, description, status, progress, lead_id, lead_name, lead_avatar, lead_role, deadline, start_date, task_count, completed_tasks, updated_at, created_at, updated_at_ts)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const p of projects) {
    insertProject.run(p.id, p.name, p.description, p.status, p.progress, p.lead_id, p.lead_name, p.lead_avatar, p.lead_role, p.deadline, p.start_date, p.task_count, p.completed_tasks, p.updated_at, now, now);
  }

  // 4. 项目-部门关联
  const projectDepts = [
    { project_id: 'p1', department_id: 'tech' },
    { project_id: 'p1', department_id: 'design' },
    { project_id: 'p2', department_id: 'design' },
    { project_id: 'p3', department_id: 'tech' },
    { project_id: 'p4', department_id: 'design' },
    { project_id: 'p4', department_id: 'tech' },
    { project_id: 'p5', department_id: 'tech' },
  ];
  const insertPD = db.prepare('INSERT INTO project_departments (project_id, department_id) VALUES (?, ?)');
  for (const pd of projectDepts) {
    insertPD.run(pd.project_id, pd.department_id);
  }

  // 5. 里程碑
  const cycles = [
    { id: 'c1-1', project_id: 'p1', name: '需求分析', description: '明确产品需求与功能范围', start_date: '6/1', end_date: '6/5', status: 'completed', color: '#30D158', order: 0 },
    { id: 'c1-2', project_id: 'p1', name: '架构设计', description: '技术架构与数据库设计', start_date: '6/5', end_date: '6/10', status: 'completed', color: '#30D158', order: 1 },
    { id: 'c1-3', project_id: 'p1', name: '核心开发', description: '前端页面与后端接口开发', start_date: '6/10', end_date: '6/20', status: 'in-progress', color: '#0A84FF', order: 2 },
    { id: 'c1-4', project_id: 'p1', name: '测试验收', description: '功能测试与Bug修复', start_date: '6/20', end_date: '6/25', status: 'pending', color: '#9CA3AF', order: 3 },
    { id: 'c1-5', project_id: 'p1', name: '上线部署', description: '生产环境部署与灰度发布', start_date: '6/25', end_date: '6/30', status: 'pending', color: '#9CA3AF', order: 4 },
    { id: 'c2-1', project_id: 'p2', name: '品牌调研', description: '竞品分析与品牌定位', start_date: '6/5', end_date: '6/12', status: 'completed', color: '#30D158', order: 0 },
    { id: 'c2-2', project_id: 'p2', name: '概念设计', description: 'Logo与色彩方案设计', start_date: '6/12', end_date: '6/25', status: 'in-progress', color: '#0A84FF', order: 1 },
    { id: 'c2-3', project_id: 'p2', name: '规范制定', description: '品牌视觉规范手册', start_date: '6/25', end_date: '7/5', status: 'pending', color: '#9CA3AF', order: 2 },
    { id: 'c2-4', project_id: 'p2', name: '全面应用', description: '全平台视觉替换', start_date: '7/5', end_date: '7/15', status: 'pending', color: '#9CA3AF', order: 3 },
    { id: 'c3-1', project_id: 'p3', name: '现状评估', description: '现有架构问题梳理', start_date: '6/10', end_date: '6/15', status: 'completed', color: '#30D158', order: 0 },
    { id: 'c3-2', project_id: 'p3', name: '方案设计', description: '新架构方案设计', start_date: '6/15', end_date: '6/25', status: 'in-progress', color: '#0A84FF', order: 1 },
    { id: 'c3-3', project_id: 'p3', name: '渐进迁移', description: '分模块迁移实施', start_date: '6/25', end_date: '7/20', status: 'pending', color: '#9CA3AF', order: 2 },
    { id: 'c3-4', project_id: 'p3', name: '验证上线', description: '性能验证与全面上线', start_date: '7/20', end_date: '8/1', status: 'pending', color: '#9CA3AF', order: 3 },
    { id: 'c4-1', project_id: 'p4', name: '需求分析', description: '官网功能与内容规划', start_date: '6/15', end_date: '6/22', status: 'in-progress', color: '#0A84FF', order: 0 },
    { id: 'c4-2', project_id: 'p4', name: '设计阶段', description: '页面设计与交互设计', start_date: '6/22', end_date: '7/10', status: 'pending', color: '#9CA3AF', order: 1 },
    { id: 'c4-3', project_id: 'p4', name: '开发阶段', description: '前端开发与CMS集成', start_date: '7/10', end_date: '7/25', status: 'pending', color: '#9CA3AF', order: 2 },
    { id: 'c4-4', project_id: 'p4', name: '上线运维', description: '部署上线与SEO优化', start_date: '7/25', end_date: '7/30', status: 'pending', color: '#9CA3AF', order: 3 },
    { id: 'c5-1', project_id: 'p5', name: '方案设计', description: '迁移方案与回滚策略', start_date: '5/20', end_date: '5/25', status: 'completed', color: '#30D158', order: 0 },
    { id: 'c5-2', project_id: 'p5', name: '数据备份', description: '全量数据备份验证', start_date: '5/25', end_date: '6/1', status: 'completed', color: '#30D158', order: 1 },
    { id: 'c5-3', project_id: 'p5', name: '迁移执行', description: '分批迁移与校验', start_date: '6/1', end_date: '6/5', status: 'completed', color: '#30D158', order: 2 },
  ];

  const insertCycle = db.prepare(`
    INSERT INTO project_cycles (id, project_id, name, description, start_date, end_date, status, color, "order", created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const c of cycles) {
    insertCycle.run(c.id, c.project_id, c.name, c.description, c.start_date, c.end_date, c.status, c.color, c.order, now);
  }

  // 6. 协作流程节点
  const workflows = [
    { id: 'w1-1', project_id: 'p1', agent_id: 'wenner', agent_name: 'Wenner', agent_avatar: '', agent_role: 'CEO', department: '管理', department_color: 'blue', order: 0, responsibility: '项目立项与需求决策' },
    { id: 'w1-2', project_id: 'p1', agent_id: 'irra', agent_name: 'Irra', agent_avatar: '/irra-avatar.png', agent_role: 'CTO', department: '技术部', department_color: 'blue', order: 1, responsibility: '技术架构设计与核心开发' },
    { id: 'w1-3', project_id: 'p1', agent_id: 'mery', agent_name: 'Mery', agent_avatar: '/mery-avatar.png', agent_role: 'CIO', department: '设计部', department_color: 'gold', order: 2, responsibility: 'UI设计与视觉规范' },
    { id: 'w1-4', project_id: 'p1', agent_id: 'jiawen', agent_name: 'JiaWen', agent_avatar: '', agent_role: '创始人', department: '管理', department_color: 'blue', order: 3, responsibility: '最终验收与战略确认' },
    { id: 'w2-1', project_id: 'p2', agent_id: 'jiawen', agent_name: 'JiaWen', agent_avatar: '', agent_role: '创始人', department: '管理', department_color: 'blue', order: 0, responsibility: '品牌方向决策' },
    { id: 'w2-2', project_id: 'p2', agent_id: 'mery', agent_name: 'Mery', agent_avatar: '/mery-avatar.png', agent_role: 'CIO', department: '设计部', department_color: 'gold', order: 1, responsibility: '视觉设计与规范制定' },
    { id: 'w2-3', project_id: 'p2', agent_id: 'wenner', agent_name: 'Wenner', agent_avatar: '', agent_role: 'CEO', department: '管理', department_color: 'blue', order: 2, responsibility: '品牌发布与市场推广' },
    { id: 'w3-1', project_id: 'p3', agent_id: 'wenner', agent_name: 'Wenner', agent_avatar: '', agent_role: 'CEO', department: '管理', department_color: 'blue', order: 0, responsibility: '重构决策与资源协调' },
    { id: 'w3-2', project_id: 'p3', agent_id: 'irra', agent_name: 'Irra', agent_avatar: '/irra-avatar.png', agent_role: 'CTO', department: '技术部', department_color: 'blue', order: 1, responsibility: '架构设计与技术实施' },
    { id: 'w3-3', project_id: 'p3', agent_id: 'jiawen', agent_name: 'JiaWen', agent_avatar: '', agent_role: '创始人', department: '管理', department_color: 'blue', order: 2, responsibility: '风险评估与最终确认' },
    { id: 'w4-1', project_id: 'p4', agent_id: 'mery', agent_name: 'Mery', agent_avatar: '/mery-avatar.png', agent_role: 'CIO', department: '设计部', department_color: 'gold', order: 0, responsibility: '设计主导与视觉把控' },
    { id: 'w4-2', project_id: 'p4', agent_id: 'irra', agent_name: 'Irra', agent_avatar: '/irra-avatar.png', agent_role: 'CTO', department: '技术部', department_color: 'blue', order: 1, responsibility: '技术实现与部署' },
    { id: 'w5-1', project_id: 'p5', agent_id: 'irra', agent_name: 'Irra', agent_avatar: '/irra-avatar.png', agent_role: 'CTO', department: '技术部', department_color: 'blue', order: 0, responsibility: '方案设计与技术实施' },
  ];

  const insertWF = db.prepare(`
    INSERT INTO workflow_nodes (id, project_id, agent_id, agent_name, agent_avatar, agent_role, department, department_color, "order", responsibility, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const w of workflows) {
    insertWF.run(w.id, w.project_id, w.agent_id, w.agent_name, w.agent_avatar, w.agent_role, w.department, w.department_color, w.order, w.responsibility, now, now);
  }

  // 7. 插入任务
  const tasks = [
    { id: 't1', title: '完成用户认证模块开发', priority: 'high', status: 'todo', project_id: 'p1', project_name: '公司管理平台 v1.0', department: '技术部', department_color: 'blue', type: '开发', assignee_id: 'irra', assignee_name: 'Irra', assignee_avatar: '/irra-avatar.png', assignee_role: 'CTO', due_date: '6月10日', description: '实现用户登录、注册、权限控制等核心认证功能' },
    { id: 't2', title: 'Dashboard 数据可视化组件', priority: 'high', status: 'in-progress', project_id: 'p1', project_name: '公司管理平台 v1.0', department: '技术部', department_color: 'blue', type: '开发', assignee_id: 'irra', assignee_name: 'Irra', assignee_avatar: '/irra-avatar.png', assignee_role: 'CTO', due_date: '6月9日', description: '开发环形图、进度条等数据可视化组件' },
    { id: 't3', title: '设计系统组件库搭建', priority: 'medium', status: 'in-progress', project_id: 'p1', project_name: '公司管理平台 v1.0', department: '设计部', department_color: 'gold', type: '设计', assignee_id: 'mery', assignee_name: 'Mery', assignee_avatar: '/mery-avatar.png', assignee_role: 'CIO', due_date: '6月12日', description: '搭建统一的UI组件库，包括按钮、卡片、输入框等' },
    { id: 't4', title: '品牌LOGO设计', priority: 'high', status: 'in-progress', project_id: 'p1', project_name: '公司管理平台 v1.0', department: '设计部', department_color: 'gold', type: '设计', assignee_id: 'mery', assignee_name: 'Mery', assignee_avatar: '/mery-avatar.png', assignee_role: 'CIO', due_date: '6月11日', description: '为启明科技设计品牌LOGO及应用场景' },
    { id: 't5', title: 'API 接口文档编写', priority: 'medium', status: 'completed', project_id: 'p1', project_name: '公司管理平台 v1.0', department: '技术部', department_color: 'blue', type: '文档', assignee_id: 'irra', assignee_name: 'Irra', assignee_avatar: '/irra-avatar.png', assignee_role: 'CTO', due_date: '6月6日', completed_at: '6月6日', description: '编写所有后端API接口的详细文档' },
    { id: 't6', title: '数据库设计与建模', priority: 'high', status: 'completed', project_id: 'p1', project_name: '公司管理平台 v1.0', department: '技术部', department_color: 'blue', type: '开发', assignee_id: 'irra', assignee_name: 'Irra', assignee_avatar: '/irra-avatar.png', assignee_role: 'CTO', due_date: '6月6日', completed_at: '6月6日', description: '设计项目、任务、文档等核心数据表结构' },
    { id: 't7', title: '项目初始化搭建', priority: 'high', status: 'completed', project_id: 'p1', project_name: '公司管理平台 v1.0', department: '技术部', department_color: 'blue', type: '开发', assignee_id: 'irra', assignee_name: 'Irra', assignee_avatar: '/irra-avatar.png', assignee_role: 'CTO', due_date: '6月7日', completed_at: '6月7日', description: '搭建React+Vite+Tailwind项目脚手架' },
    { id: 't8', title: '交互原型设计', priority: 'medium', status: 'in-progress', project_id: 'p1', project_name: '公司管理平台 v1.0', department: '设计部', department_color: 'gold', type: '设计', assignee_id: 'mery', assignee_name: 'Mery', assignee_avatar: '/mery-avatar.png', assignee_role: 'CIO', due_date: '6月13日', description: '设计完整的页面交互原型和跳转逻辑' },
    { id: 't9', title: '技术架构评审', priority: 'medium', status: 'review', project_id: 'p1', project_name: '公司管理平台 v1.0', department: '技术部', department_color: 'blue', type: '评审', assignee_id: 'irra', assignee_name: 'Irra', assignee_avatar: '/irra-avatar.png', assignee_role: 'CTO', due_date: '6月8日', description: '对整体技术架构进行评审和优化' },
    { id: 't10', title: '配色方案确认', priority: 'low', status: 'review', project_id: 'p1', project_name: '公司管理平台 v1.0', department: '设计部', department_color: 'gold', type: '评审', assignee_id: 'mery', assignee_name: 'Mery', assignee_avatar: '/mery-avatar.png', assignee_role: 'CIO', due_date: '6月8日', description: '确认蓝金粒子主题配色方案' },
    { id: 't11', title: '需求文档编写', priority: 'high', status: 'completed', project_id: 'p1', project_name: '公司管理平台 v1.0', department: '设计部', department_color: 'gold', type: '文档', assignee_id: 'mery', assignee_name: 'Mery', assignee_avatar: '/mery-avatar.png', assignee_role: 'CIO', due_date: '6月6日', completed_at: '6月6日', description: '编写PRD产品需求文档' },
    { id: 't12', title: '环境配置与CI/CD', priority: 'low', status: 'completed', project_id: 'p1', project_name: '公司管理平台 v1.0', department: '技术部', department_color: 'blue', type: '运维', assignee_id: 'irra', assignee_name: 'Irra', assignee_avatar: '/irra-avatar.png', assignee_role: 'CTO', due_date: '6月5日', completed_at: '6月5日', description: '配置开发环境和持续集成流水线' },
    { id: 't13', title: '竞品品牌分析', priority: 'high', status: 'completed', project_id: 'p2', project_name: '品牌视觉升级', department: '设计部', department_color: 'gold', type: '分析', assignee_id: 'mery', assignee_name: 'Mery', assignee_avatar: '/mery-avatar.png', assignee_role: 'CIO', due_date: '6月10日', completed_at: '6月10日', description: '分析同行业竞品品牌视觉策略' },
    { id: 't14', title: '品牌定位报告', priority: 'high', status: 'completed', project_id: 'p2', project_name: '品牌视觉升级', department: '设计部', department_color: 'gold', type: '分析', assignee_id: 'mery', assignee_name: 'Mery', assignee_avatar: '/mery-avatar.png', assignee_role: 'CIO', due_date: '6月12日', completed_at: '6月12日', description: '输出品牌定位与视觉方向报告' },
    { id: 't15', title: 'LOGO设计方案', priority: 'high', status: 'in-progress', project_id: 'p2', project_name: '品牌视觉升级', department: '设计部', department_color: 'gold', type: '设计', assignee_id: 'mery', assignee_name: 'Mery', assignee_avatar: '/mery-avatar.png', assignee_role: 'CIO', due_date: '6月20日', description: '设计3套LOGO方案供决策' },
    { id: 't16', title: '色彩系统定义', priority: 'medium', status: 'todo', project_id: 'p2', project_name: '品牌视觉升级', department: '设计部', department_color: 'gold', type: '设计', assignee_id: 'mery', assignee_name: 'Mery', assignee_avatar: '/mery-avatar.png', assignee_role: 'CIO', due_date: '6月25日', description: '定义品牌主色、辅助色、应用场景' },
    { id: 't17', title: '字体规范制定', priority: 'low', status: 'todo', project_id: 'p2', project_name: '品牌视觉升级', department: '设计部', department_color: 'gold', type: '设计', assignee_id: 'mery', assignee_name: 'Mery', assignee_avatar: '/mery-avatar.png', assignee_role: 'CIO', due_date: '6/28', description: '制定品牌字体使用规范' },
    { id: 't18', title: '视觉组件库', priority: 'medium', status: 'todo', project_id: 'p2', project_name: '品牌视觉升级', department: '设计部', department_color: 'gold', type: '设计', assignee_id: 'mery', assignee_name: 'Mery', assignee_avatar: '/mery-avatar.png', assignee_role: 'CIO', due_date: '7/5', description: '设计通用视觉组件库' },
    { id: 't19', title: '品牌手册编写', priority: 'medium', status: 'todo', project_id: 'p2', project_name: '品牌视觉升级', department: '设计部', department_color: 'gold', type: '文档', assignee_id: 'mery', assignee_name: 'Mery', assignee_avatar: '/mery-avatar.png', assignee_role: 'CIO', due_date: '7/10', description: '编写完整的品牌视觉规范手册' },
    { id: 't20', title: '全平台应用替换', priority: 'high', status: 'todo', project_id: 'p2', project_name: '品牌视觉升级', department: '技术部', department_color: 'blue', type: '开发', assignee_id: 'irra', assignee_name: 'Irra', assignee_avatar: '/irra-avatar.png', assignee_role: 'CTO', due_date: '7/15', description: '在所有产品中应用新品牌视觉' },
    { id: 't21', title: '架构问题梳理', priority: 'high', status: 'completed', project_id: 'p3', project_name: '技术架构重构', department: '技术部', department_color: 'blue', type: '分析', assignee_id: 'irra', assignee_name: 'Irra', assignee_avatar: '/irra-avatar.png', assignee_role: 'CTO', due_date: '6/15', completed_at: '6/15', description: '梳理现有架构中的技术债务' },
    { id: 't22', title: '新架构方案设计', priority: 'high', status: 'in-progress', project_id: 'p3', project_name: '技术架构重构', department: '技术部', department_color: 'blue', type: '设计', assignee_id: 'irra', assignee_name: 'Irra', assignee_avatar: '/irra-avatar.png', assignee_role: 'CTO', due_date: '6/25', description: '设计模块化微服务架构方案' },
    { id: 't23', title: '核心模块迁移', priority: 'high', status: 'todo', project_id: 'p3', project_name: '技术架构重构', department: '技术部', department_color: 'blue', type: '开发', assignee_id: 'irra', assignee_name: 'Irra', assignee_avatar: '/irra-avatar.png', assignee_role: 'CTO', due_date: '7/10', description: '将核心业务模块迁移到新架构' },
    { id: 't24', title: '性能基准测试', priority: 'medium', status: 'todo', project_id: 'p3', project_name: '技术架构重构', department: '技术部', department_color: 'blue', type: '测试', assignee_id: 'irra', assignee_name: 'Irra', assignee_avatar: '/irra-avatar.png', assignee_role: 'CTO', due_date: '7/20', description: '对比迁移前后的性能指标' },
    { id: 't25', title: '监控告警搭建', priority: 'medium', status: 'todo', project_id: 'p3', project_name: '技术架构重构', department: '技术部', department_color: 'blue', type: '运维', assignee_id: 'irra', assignee_name: 'Irra', assignee_avatar: '/irra-avatar.png', assignee_role: 'CTO', due_date: '7/25', description: '搭建新架构的监控和告警系统' },
    { id: 't26', title: '灰度发布验证', priority: 'high', status: 'todo', project_id: 'p3', project_name: '技术架构重构', department: '技术部', department_color: 'blue', type: '测试', assignee_id: 'irra', assignee_name: 'Irra', assignee_avatar: '/irra-avatar.png', assignee_role: 'CTO', due_date: '8/1', description: '灰度发布并验证系统稳定性' },
  ];

  const insertTask = db.prepare(`
    INSERT INTO tasks (id, title, priority, status, project_id, project_name, department, department_color, type, assignee_id, assignee_name, assignee_avatar, assignee_role, due_date, completed_at, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const t of tasks) {
    insertTask.run(t.id, t.title, t.priority, t.status, t.project_id, t.project_name, t.department, t.department_color, t.type, t.assignee_id, t.assignee_name, t.assignee_avatar, t.assignee_role, t.due_date, t.completed_at || null, t.description, now, now);
  }

  // 8. 文档
  const docs = [
    { id: 'd1', name: 'API 接口文档 v2.0', type: 'technical', department: '技术部', department_color: 'blue', updated_by_id: 'irra', updated_by_name: 'Irra', updated_by_avatar: '/irra-avatar.png', updated_at: '2小时前', updated_at_ts: now - 7200000, status: 'latest' },
    { id: 'd2', name: '首页视觉设计稿', type: 'design', department: '设计部', department_color: 'gold', updated_by_id: 'mery', updated_by_name: 'Mery', updated_by_avatar: '/mery-avatar.png', updated_at: '昨天', updated_at_ts: now - 86400000, status: 'latest' },
    { id: 'd3', name: '数据库设计规范', type: 'technical', department: '技术部', department_color: 'blue', updated_by_id: 'irra', updated_by_name: 'Irra', updated_by_avatar: '/irra-avatar.png', updated_at: '昨天', updated_at_ts: now - 86400000, status: 'latest' },
    { id: 'd4', name: '品牌视觉规范', type: 'design', department: '设计部', department_color: 'gold', updated_by_id: 'mery', updated_by_name: 'Mery', updated_by_avatar: '/mery-avatar.png', updated_at: '昨天', updated_at_ts: now - 86400000, status: 'latest' },
    { id: 'd5', name: '技术架构方案', type: 'architecture', department: '技术部', department_color: 'blue', updated_by_id: 'irra', updated_by_name: 'Irra', updated_by_avatar: '/irra-avatar.png', updated_at: '6月6日', updated_at_ts: now - 432000000, status: 'latest' },
    { id: 'd6', name: '品牌调研报告', type: 'product', department: '设计部', department_color: 'gold', updated_by_id: 'mery', updated_by_name: 'Mery', updated_by_avatar: '/mery-avatar.png', updated_at: '6月5日', updated_at_ts: now - 518400000, status: 'latest' },
    { id: 'd7', name: '会议纪要-0605', type: 'meeting', department: '管理', department_color: 'blue', updated_by_id: 'jiawen', updated_by_name: 'JiaWen', updated_by_avatar: '', updated_at: '6月5日', updated_at_ts: now - 518400000, status: 'latest' },
    { id: 'd8', name: '前端开发规范', type: 'technical', department: '技术部', department_color: 'blue', updated_by_id: 'irra', updated_by_name: 'Irra', updated_by_avatar: '/irra-avatar.png', updated_at: '6月4日', updated_at_ts: now - 604800000, status: 'latest' },
    { id: 'd9', name: '用户体验调研报告', type: 'design', department: '设计部', department_color: 'gold', updated_by_id: 'mery', updated_by_name: 'Mery', updated_by_avatar: '/mery-avatar.png', updated_at: '6月3日', updated_at_ts: now - 691200000, status: 'latest' },
    { id: 'd10', name: '部署运维手册', type: 'technical', department: '技术部', department_color: 'blue', updated_by_id: 'irra', updated_by_name: 'Irra', updated_by_avatar: '/irra-avatar.png', updated_at: '6月2日', updated_at_ts: now - 777600000, status: 'draft' },
  ];

  const insertDoc = db.prepare(`
    INSERT INTO documents (id, name, type, department, department_color, updated_by_id, updated_by_name, updated_by_avatar, updated_at, updated_at_ts, status, created_at, updated_at_meta)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const d of docs) {
    insertDoc.run(d.id, d.name, d.type, d.department, d.department_color, d.updated_by_id, d.updated_by_name, d.updated_by_avatar, d.updated_at, d.updated_at_ts, d.status, now, now);
  }

  // 9. 动态记录
  const activities = [
    { id: 'a1', user_id: 'irra', user_name: 'Irra', user_avatar: '/irra-avatar.png', action: '更新了', target: 'API 接口文档', target_id: 'd1', target_type: 'document', timestamp: '09:30', color: 'blue' },
    { id: 'a2', user_id: 'mery', user_name: 'Mery', user_avatar: '/mery-avatar.png', action: '完成了', target: '首页视觉设计稿', target_id: 'd2', target_type: 'document', timestamp: '09:15', color: 'gold' },
    { id: 'a3', user_id: 'wenner', user_name: 'Wenner', user_avatar: '', action: '创建了', target: 'Q3 产品规划', target_id: null, target_type: 'project', timestamp: '昨天', color: 'blue' },
    { id: 'a4', user_id: 'jiawen', user_name: 'JiaWen', user_avatar: '', action: '审批了', target: '技术架构方案', target_id: 'd5', target_type: 'document', timestamp: '昨天', color: 'gold' },
    { id: 'a5', user_id: 'irra', user_name: 'Irra', user_avatar: '/irra-avatar.png', action: '提交了', target: '数据库设计文档', target_id: null, target_type: 'document', timestamp: '6月6日', color: 'blue' },
    { id: 'a6', user_id: 'mery', user_name: 'Mery', user_avatar: '/mery-avatar.png', action: '更新了', target: '品牌视觉规范', target_id: 'd4', target_type: 'document', timestamp: '6月5日', color: 'gold' },
    { id: 'a7', user_id: 'irra', user_name: 'Irra', user_avatar: '/irra-avatar.png', action: '完成了', target: '数据迁移方案', target_id: 'p5', target_type: 'project', timestamp: '6月5日', color: 'blue' },
    { id: 'a8', user_id: 'wenner', user_name: 'Wenner', user_avatar: '', action: '召开了', target: '周度同步会议', target_id: null, target_type: 'meeting', timestamp: '6月5日', color: 'gold' },
  ];

  const insertAct = db.prepare(`
    INSERT INTO activities (id, user_id, user_name, user_avatar, action, target, target_id, target_type, timestamp, color, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const a of activities) {
    insertAct.run(a.id, a.user_id, a.user_name, a.user_avatar, a.action, a.target, a.target_id, a.target_type, a.timestamp, a.color, now);
  }

  console.log('[数据库] 种子数据灌入完成');
}
