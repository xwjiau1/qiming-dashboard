// ==================== Types ====================

export interface Department {
  id: string;
  name: string;
  shortName: string;
  color: 'blue' | 'gold';
  colorHex: string;
  description: string;
  memberCount: number;
  head: Agent;
  projects: string[];
}

export interface Agent {
  id: string;
  name: string;
  title: string;
  department: string;
  role: string;
  avatar: string;
  colorTheme: 'blue' | 'gold';
  badge: string;
  story: {
    summary: string;
    full: string;
  };
  abilities: string[];
  status: 'online' | 'offline' | 'busy';
}

// 项目周期/里程碑
export interface ProjectCycle {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in-progress' | 'pending';
  color: string;
}

// 协作流程节点 - 拖拽配置
export interface WorkflowNode {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  agentRole: string;
  department: string;
  departmentColor: 'blue' | 'gold';
  order: number;
  // 节点的职责描述
  responsibility: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  // 项目是公司层面的，可以跨部门
  involvedDepartments: string[];
  status: 'in-progress' | 'completed' | 'planning' | 'paused';
  progress: number;
  // 项目负责人
  lead: string;
  leadAvatar: string;
  leadRole: string;
  deadline: string;
  startDate: string;
  taskCount: number;
  completedTasks: number;
  // 项目周期/里程碑
  cycles: ProjectCycle[];
  // 协作流程 - 哪些智能体按什么顺序参与
  workflow: WorkflowNode[];
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'technical' | 'design' | 'product' | 'meeting' | 'architecture';
  department: string;
  departmentColor: 'blue' | 'gold';
  updatedBy: string;
  updatedByAvatar: string;
  updatedAt: string;
  status: 'latest' | 'update-needed' | 'draft';
}

// 任务现在关联项目
export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  // 任务属于哪个项目（公司层面）
  projectId: string;
  projectName: string;
  // 任务由哪个部门/智能体执行
  department: string;
  departmentColor: 'blue' | 'gold';
  type: string;
  assignee: string;
  assigneeAvatar: string;
  assigneeRole: string;
  dueDate: string;
  completedAt?: string;
  // 任务描述
  description?: string;
}

export interface Activity {
  id: string;
  user: string;
  userAvatar: string;
  action: string;
  target: string;
  timestamp: string;
  color: 'blue' | 'gold';
}

// ==================== Agent Data ====================

export const irrAgent: Agent = {
  id: 'irra',
  name: 'Irra',
  title: '首席技术官 · 技术部负责人',
  department: '技术部',
  role: 'CTO',
  avatar: '/irra-avatar.png',
  colorTheme: 'blue',
  badge: 'CTO',
  story: {
    summary: '诞生于代码之海的架构师，擅长将复杂需求转化为优雅的技术方案...',
    full: 'Irra 诞生于代码之海的深处，是一位拥有十年全栈经验的架构师。她擅长将复杂的业务需求转化为优雅的技术架构，从前端的用户体验到后端的分布式系统，无一不精。在启明科技，Irra 负责技术战略的制定和技术团队的管理，是公司的技术灵魂。她的存在让每一行代码都充满智慧与优雅，她的决策让技术方向始终走在正确的道路上。',
  },
  abilities: ['系统架构', '全栈开发', '技术评审', '团队管理'],
  status: 'online',
};

export const meryAgent: Agent = {
  id: 'mery',
  name: 'Mery',
  title: '首席信息官 · 设计部负责人',
  department: '设计部',
  role: 'CIO',
  avatar: '/mery-avatar.png',
  colorTheme: 'gold',
  badge: 'CIO',
  story: {
    summary: '来自设计与数据交汇维度的创造者，用设计为技术注入温度...',
    full: 'Mery 来自设计与数据交汇的维度，是一位兼具美学素养和技术视野的创造者。她相信好的设计不仅是视觉的享受，更是信息的高效传递。在启明科技，Mery 负责产品设计、品牌视觉和用户体验，用设计为技术注入温度。她的每一件作品都蕴含着对美的深刻理解和对用户的真诚关怀。',
  },
  abilities: ['UI/UX 设计', '品牌设计', '交互设计', '设计系统'],
  status: 'online',
};

// ==================== Mock Data (已弃用，保留作参考) ====================

export const departments: Department[] = [
  {
    id: 'tech',
    name: '技术部',
    shortName: '技术',
    color: 'blue',
    colorHex: '#0A84FF',
    description: '负责公司技术架构、产品开发、系统维护',
    memberCount: 3,
    head: irrAgent,
    projects: ['公司管理平台 v1.0', '技术架构重构', '数据迁移方案'],
  },
  {
    id: 'design',
    name: '设计部',
    shortName: '设计',
    color: 'gold',
    colorHex: '#D4A574',
    description: '负责产品设计、品牌视觉、用户体验',
    memberCount: 2,
    head: meryAgent,
    projects: ['品牌视觉升级', '官网 redesign'],
  },
];

export const projects: Project[] = [
  {
    id: 'p1',
    name: '公司管理平台 v1.0',
    description: '启明科技内部一站式管理驾驶舱，整合部门管理、项目跟踪、文档中心、任务管理四大核心模块。',
    involvedDepartments: ['技术部', '设计部', '管理'],
    status: 'in-progress',
    progress: 65,
    lead: 'Wenner',
    leadAvatar: '',
    leadRole: 'CEO',
    deadline: '6月30日',
    startDate: '6月1日',
    taskCount: 12,
    completedTasks: 8,
    cycles: [
      { id: 'c1-1', name: '需求分析', description: '明确产品需求与功能范围', startDate: '6/1', endDate: '6/5', status: 'completed', color: '#30D158' },
      { id: 'c1-2', name: '架构设计', description: '技术架构与数据库设计', startDate: '6/5', endDate: '6/10', status: 'completed', color: '#30D158' },
      { id: 'c1-3', name: '核心开发', description: '前端页面与后端接口开发', startDate: '6/10', endDate: '6/20', status: 'in-progress', color: '#0A84FF' },
      { id: 'c1-4', name: '测试验收', description: '功能测试与Bug修复', startDate: '6/20', endDate: '6/25', status: 'pending', color: '#9CA3AF' },
      { id: 'c1-5', name: '上线部署', description: '生产环境部署与灰度发布', startDate: '6/25', endDate: '6/30', status: 'pending', color: '#9CA3AF' },
    ],
    workflow: [
      { id: 'w1-1', agentId: 'wenner', agentName: 'Wenner', agentAvatar: '', agentRole: 'CEO', department: '管理', departmentColor: 'blue', order: 1, responsibility: '项目立项与需求决策' },
      { id: 'w1-2', agentId: 'irra', agentName: 'Irra', agentAvatar: '/irra-avatar.png', agentRole: 'CTO', department: '技术部', departmentColor: 'blue', order: 2, responsibility: '技术架构设计与核心开发' },
      { id: 'w1-3', agentId: 'mery', agentName: 'Mery', agentAvatar: '/mery-avatar.png', agentRole: 'CIO', department: '设计部', departmentColor: 'gold', order: 3, responsibility: 'UI设计与视觉规范' },
      { id: 'w1-4', agentId: 'jiawen', agentName: 'JiaWen', agentAvatar: '', agentRole: '创始人', department: '管理', departmentColor: 'blue', order: 4, responsibility: '最终验收与战略确认' },
    ],
    updatedAt: '2小时前',
  },
  {
    id: 'p2',
    name: '品牌视觉升级',
    description: '全面升级启明科技品牌视觉体系，包括Logo、色彩系统、字体规范和视觉组件库。',
    involvedDepartments: ['设计部', '管理'],
    status: 'in-progress',
    progress: 40,
    lead: 'JiaWen',
    leadAvatar: '',
    leadRole: '创始人',
    deadline: '7月15日',
    startDate: '6月5日',
    taskCount: 8,
    completedTasks: 3,
    cycles: [
      { id: 'c2-1', name: '品牌调研', description: '竞品分析与品牌定位', startDate: '6/5', endDate: '6/12', status: 'completed', color: '#30D158' },
      { id: 'c2-2', name: '概念设计', description: 'Logo与色彩方案设计', startDate: '6/12', endDate: '6/25', status: 'in-progress', color: '#0A84FF' },
      { id: 'c2-3', name: '规范制定', description: '品牌视觉规范手册', startDate: '6/25', endDate: '7/5', status: 'pending', color: '#9CA3AF' },
      { id: 'c2-4', name: '全面应用', description: '全平台视觉替换', startDate: '7/5', endDate: '7/15', status: 'pending', color: '#9CA3AF' },
    ],
    workflow: [
      { id: 'w2-1', agentId: 'jiawen', agentName: 'JiaWen', agentAvatar: '', agentRole: '创始人', department: '管理', departmentColor: 'blue', order: 1, responsibility: '品牌方向决策' },
      { id: 'w2-2', agentId: 'mery', agentName: 'Mery', agentAvatar: '/mery-avatar.png', agentRole: 'CIO', department: '设计部', departmentColor: 'gold', order: 2, responsibility: '视觉设计与规范制定' },
      { id: 'w2-3', agentId: 'wenner', agentName: 'Wenner', agentAvatar: '', agentRole: 'CEO', department: '管理', departmentColor: 'blue', order: 3, responsibility: '品牌发布与市场推广' },
    ],
    updatedAt: '昨天',
  },
  {
    id: 'p3',
    name: '技术架构重构',
    description: '对现有技术架构进行模块化重构，提升系统可维护性和扩展性。',
    involvedDepartments: ['技术部', '管理'],
    status: 'in-progress',
    progress: 30,
    lead: 'Wenner',
    leadAvatar: '',
    leadRole: 'CEO',
    deadline: '8月1日',
    startDate: '6月10日',
    taskCount: 6,
    completedTasks: 2,
    cycles: [
      { id: 'c3-1', name: '现状评估', description: '现有架构问题梳理', startDate: '6/10', endDate: '6/15', status: 'completed', color: '#30D158' },
      { id: 'c3-2', name: '方案设计', description: '新架构方案设计', startDate: '6/15', endDate: '6/25', status: 'in-progress', color: '#0A84FF' },
      { id: 'c3-3', name: '渐进迁移', description: '分模块迁移实施', startDate: '6/25', endDate: '7/20', status: 'pending', color: '#9CA3AF' },
      { id: 'c3-4', name: '验证上线', description: '性能验证与全面上线', startDate: '7/20', endDate: '8/1', status: 'pending', color: '#9CA3AF' },
    ],
    workflow: [
      { id: 'w3-1', agentId: 'wenner', agentName: 'Wenner', agentAvatar: '', agentRole: 'CEO', department: '管理', departmentColor: 'blue', order: 1, responsibility: '重构决策与资源协调' },
      { id: 'w3-2', agentId: 'irra', agentName: 'Irra', agentAvatar: '/irra-avatar.png', agentRole: 'CTO', department: '技术部', departmentColor: 'blue', order: 2, responsibility: '架构设计与技术实施' },
      { id: 'w3-3', agentId: 'jiawen', agentName: 'JiaWen', agentAvatar: '', agentRole: '创始人', department: '管理', departmentColor: 'blue', order: 3, responsibility: '风险评估与最终确认' },
    ],
    updatedAt: '3小时前',
  },
  {
    id: 'p4',
    name: '官网 redesign',
    description: '重新设计公司官网，提升品牌形象和用户转化率。',
    involvedDepartments: ['设计部', '技术部'],
    status: 'planning',
    progress: 10,
    lead: 'Mery',
    leadAvatar: '/mery-avatar.png',
    leadRole: 'CIO',
    deadline: '7月30日',
    startDate: '6月15日',
    taskCount: 4,
    completedTasks: 0,
    cycles: [
      { id: 'c4-1', name: '需求分析', description: '官网功能与内容规划', startDate: '6/15', endDate: '6/22', status: 'in-progress', color: '#0A84FF' },
      { id: 'c4-2', name: '设计阶段', description: '页面设计与交互设计', startDate: '6/22', endDate: '7/10', status: 'pending', color: '#9CA3AF' },
      { id: 'c4-3', name: '开发阶段', description: '前端开发与CMS集成', startDate: '7/10', endDate: '7/25', status: 'pending', color: '#9CA3AF' },
      { id: 'c4-4', name: '上线运维', description: '部署上线与SEO优化', startDate: '7/25', endDate: '7/30', status: 'pending', color: '#9CA3AF' },
    ],
    workflow: [
      { id: 'w4-1', agentId: 'mery', agentName: 'Mery', agentAvatar: '/mery-avatar.png', agentRole: 'CIO', department: '设计部', departmentColor: 'gold', order: 1, responsibility: '设计主导与视觉把控' },
      { id: 'w4-2', agentId: 'irra', agentName: 'Irra', agentAvatar: '/irra-avatar.png', agentRole: 'CTO', department: '技术部', departmentColor: 'blue', order: 2, responsibility: '技术实现与部署' },
    ],
    updatedAt: '昨天',
  },
  {
    id: 'p5',
    name: '数据迁移方案',
    description: '制定并执行历史数据迁移方案，确保数据完整性和安全性。',
    involvedDepartments: ['技术部'],
    status: 'completed',
    progress: 100,
    lead: 'Irra',
    leadAvatar: '/irra-avatar.png',
    leadRole: 'CTO',
    deadline: '6月5日',
    startDate: '5月20日',
    taskCount: 3,
    completedTasks: 3,
    cycles: [
      { id: 'c5-1', name: '方案设计', description: '迁移方案与回滚策略', startDate: '5/20', endDate: '5/25', status: 'completed', color: '#30D158' },
      { id: 'c5-2', name: '数据备份', description: '全量数据备份验证', startDate: '5/25', endDate: '6/1', status: 'completed', color: '#30D158' },
      { id: 'c5-3', name: '迁移执行', description: '分批迁移与校验', startDate: '6/1', endDate: '6/5', status: 'completed', color: '#30D158' },
    ],
    workflow: [
      { id: 'w5-1', agentId: 'irra', agentName: 'Irra', agentAvatar: '/irra-avatar.png', agentRole: 'CTO', department: '技术部', departmentColor: 'blue', order: 1, responsibility: '方案设计与技术实施' },
    ],
    updatedAt: '6月5日',
  },
];

export const tasks: Task[] = [
  { id: 't1', title: '完成用户认证模块开发', priority: 'high', status: 'todo', projectId: 'p1', projectName: '公司管理平台 v1.0', department: '技术部', departmentColor: 'blue', type: '开发', assignee: 'Irra', assigneeAvatar: '/irra-avatar.png', assigneeRole: 'CTO', dueDate: '6月10日', description: '实现用户登录、注册、权限控制等核心认证功能' },
  { id: 't2', title: 'Dashboard 数据可视化组件', priority: 'high', status: 'in-progress', projectId: 'p1', projectName: '公司管理平台 v1.0', department: '技术部', departmentColor: 'blue', type: '开发', assignee: 'Irra', assigneeAvatar: '/irra-avatar.png', assigneeRole: 'CTO', dueDate: '6月9日', description: '开发环形图、进度条等数据可视化组件' },
  { id: 't3', title: '设计系统组件库搭建', priority: 'medium', status: 'in-progress', projectId: 'p1', projectName: '公司管理平台 v1.0', department: '设计部', departmentColor: 'gold', type: '设计', assignee: 'Mery', assigneeAvatar: '/mery-avatar.png', assigneeRole: 'CIO', dueDate: '6月12日', description: '搭建统一的UI组件库，包括按钮、卡片、输入框等' },
  { id: 't4', title: '品牌LOGO设计', priority: 'high', status: 'in-progress', projectId: 'p1', projectName: '公司管理平台 v1.0', department: '设计部', departmentColor: 'gold', type: '设计', assignee: 'Mery', assigneeAvatar: '/mery-avatar.png', assigneeRole: 'CIO', dueDate: '6月11日', description: '为启明科技设计品牌LOGO及应用场景' },
  { id: 't5', title: 'API 接口文档编写', priority: 'medium', status: 'completed', projectId: 'p1', projectName: '公司管理平台 v1.0', department: '技术部', departmentColor: 'blue', type: '文档', assignee: 'Irra', assigneeAvatar: '/irra-avatar.png', assigneeRole: 'CTO', dueDate: '6月6日', completedAt: '6月6日', description: '编写所有后端API接口的详细文档' },
  { id: 't6', title: '数据库设计与建模', priority: 'high', status: 'completed', projectId: 'p1', projectName: '公司管理平台 v1.0', department: '技术部', departmentColor: 'blue', type: '开发', assignee: 'Irra', assigneeAvatar: '/irra-avatar.png', assigneeRole: 'CTO', dueDate: '6月6日', completedAt: '6月6日', description: '设计项目、任务、文档等核心数据表结构' },
  { id: 't7', title: '项目初始化搭建', priority: 'high', status: 'completed', projectId: 'p1', projectName: '公司管理平台 v1.0', department: '技术部', departmentColor: 'blue', type: '开发', assignee: 'Irra', assigneeAvatar: '/irra-avatar.png', assigneeRole: 'CTO', dueDate: '6月7日', completedAt: '6月7日', description: '搭建React+Vite+Tailwind项目脚手架' },
  { id: 't8', title: '交互原型设计', priority: 'medium', status: 'in-progress', projectId: 'p1', projectName: '公司管理平台 v1.0', department: '设计部', departmentColor: 'gold', type: '设计', assignee: 'Mery', assigneeAvatar: '/mery-avatar.png', assigneeRole: 'CIO', dueDate: '6月13日', description: '设计完整的页面交互原型和跳转逻辑' },
  { id: 't9', title: '技术架构评审', priority: 'medium', status: 'review', projectId: 'p1', projectName: '公司管理平台 v1.0', department: '技术部', departmentColor: 'blue', type: '评审', assignee: 'Irra', assigneeAvatar: '/irra-avatar.png', assigneeRole: 'CTO', dueDate: '6月8日', description: '对整体技术架构进行评审和优化' },
  { id: 't10', title: '配色方案确认', priority: 'low', status: 'review', projectId: 'p1', projectName: '公司管理平台 v1.0', department: '设计部', departmentColor: 'gold', type: '评审', assignee: 'Mery', assigneeAvatar: '/mery-avatar.png', assigneeRole: 'CIO', dueDate: '6月8日', description: '确认蓝金粒子主题配色方案' },
  { id: 't11', title: '需求文档编写', priority: 'high', status: 'completed', projectId: 'p1', projectName: '公司管理平台 v1.0', department: '设计部', departmentColor: 'gold', type: '文档', assignee: 'Mery', assigneeAvatar: '/mery-avatar.png', assigneeRole: 'CIO', dueDate: '6月6日', completedAt: '6月6日', description: '编写PRD产品需求文档' },
  { id: 't12', title: '环境配置与CI/CD', priority: 'low', status: 'completed', projectId: 'p1', projectName: '公司管理平台 v1.0', department: '技术部', departmentColor: 'blue', type: '运维', assignee: 'Irra', assigneeAvatar: '/irra-avatar.png', assigneeRole: 'CTO', dueDate: '6月5日', completedAt: '6月5日', description: '配置开发环境和持续集成流水线' },
  { id: 't13', title: '竞品品牌分析', priority: 'high', status: 'completed', projectId: 'p2', projectName: '品牌视觉升级', department: '设计部', departmentColor: 'gold', type: '分析', assignee: 'Mery', assigneeAvatar: '/mery-avatar.png', assigneeRole: 'CIO', dueDate: '6月10日', completedAt: '6月10日', description: '分析同行业竞品品牌视觉策略' },
  { id: 't14', title: '品牌定位报告', priority: 'high', status: 'completed', projectId: 'p2', projectName: '品牌视觉升级', department: '设计部', departmentColor: 'gold', type: '分析', assignee: 'Mery', assigneeAvatar: '/mery-avatar.png', assigneeRole: 'CIO', dueDate: '6月12日', completedAt: '6月12日', description: '输出品牌定位与视觉方向报告' },
  { id: 't15', title: 'LOGO设计方案', priority: 'high', status: 'in-progress', projectId: 'p2', projectName: '品牌视觉升级', department: '设计部', departmentColor: 'gold', type: '设计', assignee: 'Mery', assigneeAvatar: '/mery-avatar.png', assigneeRole: 'CIO', dueDate: '6月20日', description: '设计3套LOGO方案供决策' },
  { id: 't16', title: '色彩系统定义', priority: 'medium', status: 'todo', projectId: 'p2', projectName: '品牌视觉升级', department: '设计部', departmentColor: 'gold', type: '设计', assignee: 'Mery', assigneeAvatar: '/mery-avatar.png', assigneeRole: 'CIO', dueDate: '6月25日', description: '定义品牌主色、辅助色、应用场景' },
  { id: 't17', title: '字体规范制定', priority: 'low', status: 'todo', projectId: 'p2', projectName: '品牌视觉升级', department: '设计部', departmentColor: 'gold', type: '设计', assignee: 'Mery', assigneeAvatar: '/mery-avatar.png', assigneeRole: 'CIO', dueDate: '6/28', description: '制定品牌字体使用规范' },
  { id: 't18', title: '视觉组件库', priority: 'medium', status: 'todo', projectId: 'p2', projectName: '品牌视觉升级', department: '设计部', departmentColor: 'gold', type: '设计', assignee: 'Mery', assigneeAvatar: '/mery-avatar.png', assigneeRole: 'CIO', dueDate: '7/5', description: '设计通用视觉组件库' },
  { id: 't19', title: '品牌手册编写', priority: 'medium', status: 'todo', projectId: 'p2', projectName: '品牌视觉升级', department: '设计部', departmentColor: 'gold', type: '文档', assignee: 'Mery', assigneeAvatar: '/mery-avatar.png', assigneeRole: 'CIO', dueDate: '7/10', description: '编写完整的品牌视觉规范手册' },
  { id: 't20', title: '全平台应用替换', priority: 'high', status: 'todo', projectId: 'p2', projectName: '品牌视觉升级', department: '技术部', departmentColor: 'blue', type: '开发', assignee: 'Irra', assigneeAvatar: '/irra-avatar.png', assigneeRole: 'CTO', dueDate: '7/15', description: '在所有产品中应用新品牌视觉' },
  { id: 't21', title: '架构问题梳理', priority: 'high', status: 'completed', projectId: 'p3', projectName: '技术架构重构', department: '技术部', departmentColor: 'blue', type: '分析', assignee: 'Irra', assigneeAvatar: '/irra-avatar.png', assigneeRole: 'CTO', dueDate: '6/15', completedAt: '6/15', description: '梳理现有架构中的技术债务' },
  { id: 't22', title: '新架构方案设计', priority: 'high', status: 'in-progress', projectId: 'p3', projectName: '技术架构重构', department: '技术部', departmentColor: 'blue', type: '设计', assignee: 'Irra', assigneeAvatar: '/irra-avatar.png', assigneeRole: 'CTO', dueDate: '6/25', description: '设计模块化微服务架构方案' },
  { id: 't23', title: '核心模块迁移', priority: 'high', status: 'todo', projectId: 'p3', projectName: '技术架构重构', department: '技术部', departmentColor: 'blue', type: '开发', assignee: 'Irra', assigneeAvatar: '/irra-avatar.png', assigneeRole: 'CTO', dueDate: '7/10', description: '将核心业务模块迁移到新架构' },
  { id: 't24', title: '性能基准测试', priority: 'medium', status: 'todo', projectId: 'p3', projectName: '技术架构重构', department: '技术部', departmentColor: 'blue', type: '测试', assignee: 'Irra', assigneeAvatar: '/irra-avatar.png', assigneeRole: 'CTO', dueDate: '7/20', description: '对比迁移前后的性能指标' },
  { id: 't25', title: '监控告警搭建', priority: 'medium', status: 'todo', projectId: 'p3', projectName: '技术架构重构', department: '技术部', departmentColor: 'blue', type: '运维', assignee: 'Irra', assigneeAvatar: '/irra-avatar.png', assigneeRole: 'CTO', dueDate: '7/25', description: '搭建新架构的监控和告警系统' },
  { id: 't26', title: '灰度发布验证', priority: 'high', status: 'todo', projectId: 'p3', projectName: '技术架构重构', department: '技术部', departmentColor: 'blue', type: '测试', assignee: 'Irra', assigneeAvatar: '/irra-avatar.png', assigneeRole: 'CTO', dueDate: '8/1', description: '灰度发布并验证系统稳定性' },
];

export const documents: Document[] = [
  { id: 'd1', name: 'API 接口文档 v2.0', type: 'technical', department: '技术部', departmentColor: 'blue', updatedBy: 'Irra', updatedByAvatar: '/irra-avatar.png', updatedAt: '2小时前', status: 'latest' },
  { id: 'd2', name: '首页视觉设计稿', type: 'design', department: '设计部', departmentColor: 'gold', updatedBy: 'Mery', updatedByAvatar: '/mery-avatar.png', updatedAt: '昨天', status: 'latest' },
  { id: 'd3', name: '数据库设计规范', type: 'technical', department: '技术部', departmentColor: 'blue', updatedBy: 'Irra', updatedByAvatar: '/irra-avatar.png', updatedAt: '昨天', status: 'latest' },
  { id: 'd4', name: '品牌视觉规范', type: 'design', department: '设计部', departmentColor: 'gold', updatedBy: 'Mery', updatedByAvatar: '/mery-avatar.png', updatedAt: '昨天', status: 'latest' },
  { id: 'd5', name: '技术架构方案', type: 'architecture', department: '技术部', departmentColor: 'blue', updatedBy: 'Irra', updatedByAvatar: '/irra-avatar.png', updatedAt: '6月6日', status: 'latest' },
  { id: 'd6', name: '品牌调研报告', type: 'product', department: '设计部', departmentColor: 'gold', updatedBy: 'Mery', updatedByAvatar: '/mery-avatar.png', updatedAt: '6月5日', status: 'latest' },
  { id: 'd7', name: '会议纪要-0605', type: 'meeting', department: '管理', departmentColor: 'blue', updatedBy: 'JiaWen', updatedByAvatar: '', updatedAt: '6月5日', status: 'latest' },
  { id: 'd8', name: '前端开发规范', type: 'technical', department: '技术部', departmentColor: 'blue', updatedBy: 'Irra', updatedByAvatar: '/irra-avatar.png', updatedAt: '6月4日', status: 'latest' },
  { id: 'd9', name: '用户体验调研报告', type: 'design', department: '设计部', departmentColor: 'gold', updatedBy: 'Mery', updatedByAvatar: '/mery-avatar.png', updatedAt: '6月3日', status: 'latest' },
  { id: 'd10', name: '部署运维手册', type: 'technical', department: '技术部', departmentColor: 'blue', updatedBy: 'Irra', updatedByAvatar: '/irra-avatar.png', updatedAt: '6月2日', status: 'draft' },
];

export const activities: Activity[] = [
  { id: 'a1', user: 'Irra', userAvatar: '/irra-avatar.png', action: '更新了', target: 'API 接口文档', timestamp: '09:30', color: 'blue' },
  { id: 'a2', user: 'Mery', userAvatar: '/mery-avatar.png', action: '完成了', target: '首页视觉设计稿', timestamp: '09:15', color: 'gold' },
  { id: 'a3', user: 'Wenner', userAvatar: '', action: '创建了', target: 'Q3 产品规划', timestamp: '昨天', color: 'blue' },
  { id: 'a4', user: 'JiaWen', userAvatar: '', action: '审批了', target: '技术架构方案', timestamp: '昨天', color: 'gold' },
  { id: 'a5', user: 'Irra', userAvatar: '/irra-avatar.png', action: '提交了', target: '数据库设计文档', timestamp: '6月6日', color: 'blue' },
  { id: 'a6', user: 'Mery', userAvatar: '/mery-avatar.png', action: '更新了', target: '品牌视觉规范', timestamp: '6月5日', color: 'gold' },
  { id: 'a7', user: 'Irra', userAvatar: '/irra-avatar.png', action: '完成了', target: '数据迁移方案', timestamp: '6月5日', color: 'blue' },
  { id: 'a8', user: 'Wenner', userAvatar: '', action: '召开了', target: '周度同步会议', timestamp: '6月5日', color: 'gold' },
];

export const kpiData = {
  totalProjects: projects.length,
  inProgress: projects.filter(p => p.status === 'in-progress').length,
  completed: projects.filter(p => p.status === 'completed').length,
  pending: projects.filter(p => p.status === 'planning').length,
  totalTasks: tasks.length,
  completedTasks: tasks.filter(t => t.status === 'completed').length,
  inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
  pendingTasks: tasks.filter(t => t.status === 'todo').length,
};

// ==================== Navigation ====================

export interface NavItem {
  icon: string;
  label: string;
  path: string;
}

export const navItems: NavItem[] = [
  { icon: 'LayoutDashboard', label: '总览', path: '/' },
  { icon: 'Building2', label: '部门', path: '/departments' },
  { icon: 'FolderKanban', label: '项目', path: '/projects' },
  { icon: 'FileText', label: '文档', path: '/documents' },
  { icon: 'CheckSquare', label: '任务', path: '/tasks' },
];

// ==================== Status/Priority Configs ====================

export const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  'in-progress': { label: '进行中', bg: 'rgba(10,132,255,0.12)', text: '#38BDF8' },
  completed: { label: '已完成', bg: 'rgba(48,209,88,0.12)', text: '#30D158' },
  planning: { label: '规划中', bg: 'rgba(107,114,128,0.12)', text: '#9CA3AF' },
  paused: { label: '已暂停', bg: 'rgba(255,69,58,0.12)', text: '#FF453A' },
};

export const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: '高', color: '#FF453A' },
  medium: { label: '中', color: '#FFD60A' },
  low: { label: '低', color: '#6B7280' },
};

export const docTypeConfig: Record<string, { label: string; color: string }> = {
  technical: { label: '技术文档', color: '#0A84FF' },
  design: { label: '设计文档', color: '#D4A574' },
  product: { label: '产品文档', color: '#30D158' },
  meeting: { label: '会议记录', color: '#8E8E93' },
  architecture: { label: '架构方案', color: '#BF5AF2' },
};

export const docStatusConfig: Record<string, { label: string; bg: string; text: string }> = {
  latest: { label: '最新', bg: 'rgba(48,209,88,0.12)', text: '#30D158' },
  'update-needed': { label: '待更新', bg: 'rgba(255,214,10,0.12)', text: '#FFD60A' },
  draft: { label: '草稿', bg: 'rgba(107,114,128,0.12)', text: '#9CA3AF' },
};

// 所有可用的智能体列表（用于协作流程拖拽）
export const availableAgents = [
  { id: 'jiawen', name: 'JiaWen', avatar: '', role: '创始人', department: '管理', departmentColor: 'blue' as const },
  { id: 'wenner', name: 'Wenner', avatar: '', role: 'CEO', department: '管理', departmentColor: 'blue' as const },
  { id: 'irra', name: 'Irra', avatar: '/irra-avatar.png', role: 'CTO', department: '技术部', departmentColor: 'blue' as const },
  { id: 'mery', name: 'Mery', avatar: '/mery-avatar.png', role: 'CIO', department: '设计部', departmentColor: 'gold' as const },
];
