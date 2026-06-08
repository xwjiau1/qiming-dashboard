import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  departments as staticDepartments,
  projects as staticProjects,
  tasks as staticTasks,
  documents as staticDocuments,
  activities as staticActivities,
  kpiData as staticKpiData,
} from '@/data/static-data'

// ==================== 数据转换函数 ====================

function dbToProject(db: any): any {
  return {
    ...db,
    involvedDepartments: db.involved_departments || db.involvedDepartments || [],
    taskCount: db.task_count || db.taskCount || 0,
    completedTasks: db.completed_tasks || db.completedTasks || 0,
    startDate: db.start_date || db.startDate || '',
    leadAvatar: db.lead_avatar || db.leadAvatar || '',
    leadRole: db.lead_role || db.leadRole || '',
    updatedAt: db.updated_at || db.updatedAt || '',
    cycles: db.project_cycles || db.cycles || [],
    workflow: db.workflow_nodes || db.workflow || [],
  }
}

function dbToTask(db: any): any {
  return {
    ...db,
    projectId: db.project_id || db.projectId || '',
    projectName: db.project_name || db.projectName || '',
    departmentColor: db.department_color || db.departmentColor || 'blue',
    assigneeAvatar: db.assignee_avatar || db.assigneeAvatar || '',
    assigneeRole: db.assignee_role || db.assigneeRole || '',
    dueDate: db.due_date || db.dueDate || '',
    completedAt: db.completed_at || db.completedAt || undefined,
  }
}

function dbToDocument(db: any): any {
  return {
    ...db,
    departmentColor: db.department_color || db.departmentColor || 'blue',
    updatedBy: db.updated_by || db.updatedBy || '',
    updatedByAvatar: db.updated_by_avatar || db.updatedByAvatar || '',
    updatedAt: db.updated_at || db.updatedAt || '',
  }
}

function dbToActivity(db: any): any {
  return {
    ...db,
    user: db.user_name || db.user || '',
    userAvatar: db.user_avatar || db.userAvatar || '',
    timestamp: db.created_at || db.timestamp || '',
  }
}

// ==================== 部门 ====================

export async function getDepartments() {
  if (!isSupabaseConfigured) return staticDepartments
  try {
    const { data, error } = await supabase.from('departments').select('*').order('name')
    if (error || !data?.length) return staticDepartments
    return data.map((d: any) => ({
      ...d,
      shortName: d.short_name || d.shortName,
      colorHex: d.color_hex || d.colorHex,
      memberCount: d.member_count || d.memberCount,
    }))
  } catch {
    return staticDepartments
  }
}

// ==================== 智能体 ====================

export async function getAgents() {
  if (!isSupabaseConfigured) return []
  try {
    const { data, error } = await supabase.from('agents').select('*').order('name')
    if (error || !data?.length) return []
    return data.map((a: any) => ({
      ...a,
      colorTheme: a.color_theme || a.colorTheme,
      departmentId: a.department_id,
    }))
  } catch {
    return []
  }
}

// ==================== 项目 ====================

export async function getProjects() {
  if (!isSupabaseConfigured) return staticProjects
  try {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (error || !data?.length) return staticProjects
    return data.map(dbToProject)
  } catch {
    return staticProjects
  }
}

export async function getProjectById(id: string) {
  if (!isSupabaseConfigured) return staticProjects.find(p => p.id === id) || null
  try {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
    if (error || !data) return staticProjects.find(p => p.id === id) || null
    return dbToProject(data)
  } catch {
    return staticProjects.find(p => p.id === id) || null
  }
}

export async function getProjectCycles(projectId: string) {
  if (!isSupabaseConfigured) return staticProjects.find(p => p.id === projectId)?.cycles || []
  try {
    const { data, error } = await supabase.from('project_cycles').select('*').eq('project_id', projectId).order('start_date')
    if (error || !data?.length) return staticProjects.find(p => p.id === projectId)?.cycles || []
    return data
  } catch {
    return staticProjects.find(p => p.id === projectId)?.cycles || []
  }
}

export async function getWorkflowNodes(projectId: string) {
  if (!isSupabaseConfigured) return staticProjects.find(p => p.id === projectId)?.workflow || []
  try {
    const { data, error } = await supabase.from('workflow_nodes').select('*').eq('project_id', projectId).order('order_num')
    if (error || !data?.length) return staticProjects.find(p => p.id === projectId)?.workflow || []
    return data.map((w: any) => ({ ...w, departmentColor: w.department_color || w.departmentColor }))
  } catch {
    return staticProjects.find(p => p.id === projectId)?.workflow || []
  }
}

// ==================== 任务 ====================

export async function getTasks() {
  if (!isSupabaseConfigured) return staticTasks
  try {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
    if (error || !data?.length) return staticTasks
    return data.map(dbToTask)
  } catch {
    return staticTasks
  }
}

// ==================== 文档 ====================

export async function getDocuments() {
  if (!isSupabaseConfigured) return staticDocuments
  try {
    const { data, error } = await supabase.from('documents').select('*').order('updated_at', { ascending: false })
    if (error || !data?.length) return staticDocuments
    return data.map(dbToDocument)
  } catch {
    return staticDocuments
  }
}

// ==================== 动态 ====================

export async function getActivities(limit: number = 20) {
  if (!isSupabaseConfigured) return staticActivities
  try {
    const { data, error } = await supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(limit)
    if (error || !data?.length) return staticActivities
    return data.map(dbToActivity)
  } catch {
    return staticActivities
  }
}

// ==================== 仪表盘统计 ====================

export async function getDashboardStats() {
  if (!isSupabaseConfigured) return staticKpiData
  try {
    const { data: projects, error: pErr } = await supabase.from('projects').select('status')
    const { data: tasks, error: tErr } = await supabase.from('tasks').select('status')
    if (pErr || tErr || !projects || !tasks) return staticKpiData

    return {
      totalProjects: projects.length,
      inProgress: projects.filter((p: any) => p.status === 'in_progress').length,
      completed: projects.filter((p: any) => p.status === 'completed').length,
      pending: projects.filter((p: any) => p.status === 'planning').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t: any) => t.status === 'completed').length,
      inProgressTasks: tasks.filter((t: any) => t.status === 'in_progress').length,
      pendingTasks: tasks.filter((t: any) => t.status === 'todo').length,
    }
  } catch {
    return staticKpiData
  }
}

// ==================== 用户 ====================

export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
    return data || null
  } catch {
    return null
  }
}

// ==================== CRUD 操作 ====================

export async function createProject(project: any) {
  if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase 未配置') }
  try {
    const { data, error } = await supabase.from('projects').insert([project]).select().single()
    return { data, error }
  } catch (err: any) {
    return { data: null, error: err }
  }
}

export async function updateProject(id: string, updates: any) {
  if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase 未配置') }
  try {
    const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single()
    return { data, error }
  } catch (err: any) {
    return { data: null, error: err }
  }
}

export async function deleteProject(id: string) {
  if (!isSupabaseConfigured) return { error: new Error('Supabase 未配置') }
  try {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    return { error }
  } catch (err: any) {
    return { error: err }
  }
}

export async function createTask(task: any) {
  if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase 未配置') }
  try {
    const { data, error } = await supabase.from('tasks').insert([task]).select().single()
    return { data, error }
  } catch (err: any) {
    return { data: null, error: err }
  }
}

export async function updateTask(id: string, updates: any) {
  if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase 未配置') }
  try {
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single()
    return { data, error }
  } catch (err: any) {
    return { data: null, error: err }
  }
}

export async function deleteTask(id: string) {
  if (!isSupabaseConfigured) return { error: new Error('Supabase 未配置') }
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    return { error }
  } catch (err: any) {
    return { error: err }
  }
}

export async function createDocument(doc: any) {
  if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase 未配置') }
  try {
    const { data, error } = await supabase.from('documents').insert([doc]).select().single()
    return { data, error }
  } catch (err: any) {
    return { data: null, error: err }
  }
}

export async function updateDocument(id: string, updates: any) {
  if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase 未配置') }
  try {
    const { data, error } = await supabase.from('documents').update(updates).eq('id', id).select().single()
    return { data, error }
  } catch (err: any) {
    return { data: null, error: err }
  }
}

export async function deleteDocument(id: string) {
  if (!isSupabaseConfigured) return { error: new Error('Supabase 未配置') }
  try {
    const { error } = await supabase.from('documents').delete().eq('id', id)
    return { error }
  } catch (err: any) {
    return { error: err }
  }
}

export async function createActivity(activity: any) {
  if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase 未配置') }
  try {
    const { data, error } = await supabase.from('activities').insert([activity]).select().single()
    return { data, error }
  } catch (err: any) {
    return { data: null, error: err }
  }
}

// ==================== 实时订阅 ====================

export function subscribeToTasks(callback: (payload: any) => void) {
  if (!isSupabaseConfigured) return null
  return supabase
    .channel('tasks-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, callback)
    .subscribe()
}

export function subscribeToProjects(callback: (payload: any) => void) {
  if (!isSupabaseConfigured) return null
  return supabase
    .channel('projects-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, callback)
    .subscribe()
}

export function subscribeToActivities(callback: (payload: any) => void) {
  if (!isSupabaseConfigured) return null
  return supabase
    .channel('activities-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, callback)
    .subscribe()
}

export function unsubscribe(channel: any) {
  if (channel) channel.unsubscribe()
}

// ==================== 复合数据加载 ====================

export async function loadAllData() {
  const [departments, projects, tasks, documents, activities, stats] = await Promise.all([
    getDepartments(),
    getProjects(),
    getTasks(),
    getDocuments(),
    getActivities(),
    getDashboardStats(),
  ])
  return { departments, projects, tasks, documents, activities, stats }
}
