import { supabase } from '@/lib/supabase';
import type {
  DbDepartment, DbAgent, DbProject, DbProjectCycle,
  DbWorkflowNode, DbTask, DbDocument, DbActivity, DbUser,
  DbDashboardStats
} from '@/types/supabase';

// ==================== 部门 ====================
export async function getDepartments(): Promise<DbDepartment[]> {
  const { data, error } = await supabase
    .from('departments')
    .select('*, agents:head_agent_id(*)')
    .order('id');
  if (error) {
    console.error('获取部门失败:', error);
    return [];
  }
  return (data || []) as DbDepartment[];
}

export async function getDepartmentById(id: string): Promise<DbDepartment | null> {
  const { data, error } = await supabase
    .from('departments')
    .select('*, agents:head_agent_id(*)')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as DbDepartment;
}

// ==================== 智能体 ====================
export async function getAgents(): Promise<DbAgent[]> {
  const { data, error } = await supabase
    .from('agents')
    .select('*, departments:department_id(name,color_hex)')
    .order('id');
  if (error) {
    console.error('获取智能体失败:', error);
    return [];
  }
  return (data || []) as DbAgent[];
}

export async function getAgentById(id: string): Promise<DbAgent | null> {
  const { data, error } = await supabase
    .from('agents')
    .select('*, departments:department_id(*)')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as DbAgent;
}

export async function updateAgentStory(
  id: string,
  story: { summary: string; full: string },
  abilities: string[]
): Promise<any | null> {
  const { data, error } = await supabase
    .from('agents')
    .update({ story, abilities } as never)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DbAgent;
}

// ==================== 项目 ====================
export async function getProjects(): Promise<DbProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at_timestamp', { ascending: false });
  if (error) {
    console.error('获取项目失败:', error);
    return [];
  }
  return (data || []) as DbProject[];
}

export async function getProjectById(id: string): Promise<DbProject | null> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_cycles(*),
      workflow_nodes(*),
      tasks(*)
    `)
    .eq('id', id)
    .single();
  if (error) return null;
  return data as DbProject;
}

export async function getProjectsByStatus(status: string): Promise<DbProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', status)
    .order('created_at_timestamp', { ascending: false });
  if (error) return [];
  return (data || []) as DbProject[];
}

export async function createProject(project: any): Promise<any | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert(project as never)
    .select()
    .single();
  if (error) throw error;
  return data as DbProject;
}

export async function updateProject(id: string, updates: any): Promise<any | null> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DbProject;
}

export async function searchProjects(query: string): Promise<DbProject[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id,name,status,progress,description')
    .ilike('name', `%${query}%`);
  if (error) return [];
  return (data || []) as DbProject[];
}

// ==================== 项目周期 ====================
export async function getProjectCycles(projectId: string): Promise<DbProjectCycle[]> {
  const { data, error } = await supabase
    .from('project_cycles')
    .select('*')
    .eq('project_id', projectId)
    .order('display_order');
  if (error) return [];
  return (data || []) as DbProjectCycle[];
}

// ==================== 协作流程节点 ====================
export async function getWorkflowNodes(projectId: string): Promise<DbWorkflowNode[]> {
  const { data, error } = await supabase
    .from('workflow_nodes')
    .select('*')
    .eq('project_id', projectId)
    .order('display_order');
  if (error) return [];
  return (data || []) as DbWorkflowNode[];
}

export async function updateWorkflowNodeOrder(
  nodes: { id: string; display_order: number; version: number }[]
): Promise<void> {
  for (const node of nodes) {
    const { error } = await supabase
      .from('workflow_nodes')
      .update({ display_order: node.display_order, version: node.version + 1 } as never)
      .eq('id', node.id)
      .eq('version', node.version);
    if (error) throw error;
  }
}

export async function updateWorkflowResponsibility(
  id: string,
  responsibility: string
): Promise<any | null> {
  const { data, error } = await supabase
    .from('workflow_nodes')
    .update({ responsibility } as never)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DbWorkflowNode;
}

// ==================== 任务 ====================
export async function getTasks(): Promise<DbTask[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('获取任务失败:', error);
    return [];
  }
  return (data || []) as DbTask[];
}

export async function getTasksByProject(projectId: string): Promise<DbTask[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('priority', { ascending: false });
  if (error) return [];
  return (data || []) as DbTask[];
}

export async function getTasksByStatus(status: string): Promise<DbTask[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []) as DbTask[];
}

export async function createTask(task: any): Promise<any | null> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task as never)
    .select()
    .single();
  if (error) throw error;
  return data as DbTask;
}

export async function updateTask(id: string, updates: any): Promise<any | null> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as DbTask;
}

// ==================== 文档 ====================
export async function getDocuments(): Promise<DbDocument[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('updated_at_timestamp', { ascending: false });
  if (error) {
    console.error('获取文档失败:', error);
    return [];
  }
  return (data || []) as DbDocument[];
}

export async function getDocumentsByType(type: string): Promise<DbDocument[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('type', type)
    .order('updated_at_timestamp', { ascending: false });
  if (error) return [];
  return (data || []) as DbDocument[];
}

export async function searchDocuments(query: string): Promise<DbDocument[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .ilike('name', `%${query}%`);
  if (error) return [];
  return (data || []) as DbDocument[];
}

export async function createDocument(doc: any): Promise<any | null> {
  const { data, error } = await supabase
    .from('documents')
    .insert(doc as never)
    .select()
    .single();
  if (error) throw error;
  return data as DbDocument;
}

// ==================== 活动/动态 ====================
export async function getActivities(limit = 20): Promise<DbActivity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('获取活动失败:', error);
    return [];
  }
  return (data || []) as DbActivity[];
}

// ==================== 仪表盘 KPI ====================
export async function getDashboardStats(): Promise<DbDashboardStats | null> {
  const { data, error } = await supabase
    .from('dashboard_stats')
    .select('*')
    .single();
  if (error) {
    console.error('获取仪表盘统计失败:', error);
    return null;
  }
  return data as DbDashboardStats;
}

// ==================== 用户 ====================
export async function getCurrentUser(): Promise<DbUser | null> {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) return null;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.user.id)
    .single();
  if (error) return null;
  return data as DbUser;
}
