// ==================== Supabase 数据库类型定义 ====================
// 根据数据库设计与API规范手动定义，与前端数据模型对齐

export type ColorTheme = 'blue' | 'gold';
export type AgentStatus = 'online' | 'offline' | 'busy';
export type ProjectStatus = 'in-progress' | 'completed' | 'planning' | 'paused';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed';
export type DocumentType = 'technical' | 'design' | 'product' | 'meeting' | 'architecture';
export type DocumentStatus = 'latest' | 'update-needed' | 'draft';
export type UserRole = 'founder' | 'ceo' | 'cto' | 'cio' | 'member';
export type CycleStatus = 'completed' | 'in-progress' | 'pending';

// ==================== 数据库表行类型 ====================

export interface DbUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string | null;
  department_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbDepartment {
  id: string;
  name: string;
  short_name: string;
  color: ColorTheme;
  color_hex: string;
  description: string;
  member_count: number;
  head_agent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbAgent {
  id: string;
  name: string;
  title: string;
  department_id: string;
  role: string;
  avatar: string | null;
  color_theme: ColorTheme;
  badge: string;
  story: { summary: string; full: string };
  abilities: string[];
  status: AgentStatus;
  created_at: string;
  updated_at: string;
}

export interface DbProject {
  id: string;
  name: string;
  description: string;
  involved_departments: string[];
  status: ProjectStatus;
  progress: number;
  lead: string;
  lead_avatar: string | null;
  lead_role: string;
  deadline: string | null;
  start_date: string | null;
  task_count: number;
  completed_tasks: number;
  updated_at: string | null;
  created_at: string;
  updated_at_timestamp: string;
}

export interface DbProjectCycle {
  id: string;
  project_id: string;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  status: CycleStatus;
  color: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbWorkflowNode {
  id: string;
  project_id: string;
  agent_id: string;
  agent_name: string;
  agent_avatar: string | null;
  agent_role: string;
  department_id: string | null;
  department_color: ColorTheme;
  display_order: number;
  responsibility: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface DbTask {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  project_id: string;
  project_name: string;
  department_id: string | null;
  department_color: ColorTheme;
  type: string;
  assignee_id: string | null;
  assignee_name: string;
  assignee_avatar: string | null;
  assignee_role: string;
  due_date: string | null;
  completed_at: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbDocument {
  id: string;
  name: string;
  type: DocumentType;
  department_id: string | null;
  department_color: ColorTheme;
  updated_by: string;
  updated_by_avatar: string | null;
  updated_at: string;
  updated_at_timestamp: string;
  status: DocumentStatus;
  file_path: string | null;
  file_size: number | null;
  file_mime_type: string | null;
  created_at: string;
  updated_at_backend: string;
}

export interface DbActivity {
  id: string;
  user_id: string | null;
  user_name: string;
  user_avatar: string | null;
  action: string;
  target: string;
  target_type: string;
  target_id: string | null;
  color: ColorTheme;
  created_at: string;
}

export interface DbSettings {
  id: string;
  key: string;
  value: Record<string, unknown>;
  description: string | null;
  updated_at: string;
}

export interface DbDashboardStats {
  total_projects: number;
  in_progress_projects: number;
  completed_projects: number;
  pending_projects: number;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  online_agents: number;
  latest_documents: number;
}

// ==================== 数据库类型总览 ====================

export interface Database {
  public: {
    Tables: {
      users: { Row: DbUser; Insert: Omit<DbUser, 'created_at' | 'updated_at'>; Update: Partial<DbUser> };
      departments: { Row: DbDepartment; Insert: Omit<DbDepartment, 'created_at' | 'updated_at'>; Update: Partial<DbDepartment> };
      agents: { Row: DbAgent; Insert: Omit<DbAgent, 'created_at' | 'updated_at'>; Update: Partial<DbAgent> };
      projects: { Row: DbProject; Insert: Omit<DbProject, 'created_at' | 'updated_at_timestamp'>; Update: Partial<DbProject> };
      project_cycles: { Row: DbProjectCycle; Insert: Omit<DbProjectCycle, 'created_at' | 'updated_at'>; Update: Partial<DbProjectCycle> };
      workflow_nodes: { Row: DbWorkflowNode; Insert: Omit<DbWorkflowNode, 'created_at' | 'updated_at'>; Update: Partial<DbWorkflowNode> };
      tasks: { Row: DbTask; Insert: Omit<DbTask, 'created_at' | 'updated_at'>; Update: Partial<DbTask> };
      documents: { Row: DbDocument; Insert: Omit<DbDocument, 'created_at' | 'updated_at_backend'>; Update: Partial<DbDocument> };
      activities: { Row: DbActivity; Insert: Omit<DbActivity, 'id' | 'created_at'>; Update: Partial<DbActivity> };
      settings: { Row: DbSettings; Insert: Omit<DbSettings, 'updated_at'>; Update: Partial<DbSettings> };
      dashboard_stats: { Row: DbDashboardStats };
    };
    Enums: {
      color_theme: ColorTheme;
      agent_status: AgentStatus;
      project_status: ProjectStatus;
      task_priority: TaskPriority;
      task_status: TaskStatus;
      document_type: DocumentType;
      document_status: DocumentStatus;
      user_role: UserRole;
      cycle_status: CycleStatus;
    };
  };
}

// ==================== 常用类型别名 ====================

export type Department = DbDepartment;
export type Agent = DbAgent;
export type Project = DbProject;
export type ProjectCycle = DbProjectCycle;
export type WorkflowNode = DbWorkflowNode;
export type Task = DbTask;
export type Document = DbDocument;
export type Activity = DbActivity;
export type User = DbUser;
export type Settings = DbSettings;
export type DashboardStats = DbDashboardStats;
