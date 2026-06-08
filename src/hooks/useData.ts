import { useState, useEffect, useCallback } from 'react'
import {
  getDepartments, getAgents, getProjects, getTasks, getDocuments, getActivities, getDashboardStats,
  createProject as supabaseCreateProject,
  updateProject as supabaseUpdateProject,
  deleteProject as supabaseDeleteProject,
  createTask as supabaseCreateTask,
  updateTask as supabaseUpdateTask,
  deleteTask as supabaseDeleteTask,
  createDocument as supabaseCreateDocument,
  updateDocument as supabaseUpdateDocument,
  deleteDocument as supabaseDeleteDocument,
  createActivity as supabaseCreateActivity,
  subscribeToTasks, subscribeToProjects, subscribeToActivities, unsubscribe,
} from '@/hooks/useSupabase'
import { isSupabaseConfigured } from '@/lib/supabase'
import { toast } from 'sonner'

// 静态数据作为离线备用
import {
  departments as staticDepartments,
  irrAgent as staticIrrAgent,
  meryAgent as staticMeryAgent,
  projects as staticProjects,
  tasks as staticTasks,
  documents as staticDocuments,
  activities as staticActivities,
  kpiData as staticKpiData,
} from '@/data/static-data'

// 静态智能体列表
const staticAgents = [staticIrrAgent, staticMeryAgent]

export interface AppData {
  departments: any[]
  agents: any[]
  projects: any[]
  tasks: any[]
  documents: any[]
  activities: any[]
  stats: any
  loading: boolean
  error: string | null
  refresh: () => void
  // CRUD 方法
  addProject: (project: any) => Promise<void>
  editProject: (id: string, updates: any) => Promise<void>
  removeProject: (id: string) => Promise<void>
  addTask: (task: any) => Promise<void>
  editTask: (id: string, updates: any) => Promise<void>
  removeTask: (id: string) => Promise<void>
  addDocument: (doc: any) => Promise<void>
  editDocument: (id: string, updates: any) => Promise<void>
  removeDocument: (id: string) => Promise<void>
  addActivity: (activity: any) => Promise<void>
}

export function useData(): AppData {
  const [departments, setDepartments] = useState<any[]>(staticDepartments)
  const [agents, setAgents] = useState<any[]>(staticAgents)
  const [projects, setProjects] = useState<any[]>(staticProjects)
  const [tasks, setTasks] = useState<any[]>(staticTasks)
  const [documents, setDocuments] = useState<any[]>(staticDocuments)
  const [activities, setActivities] = useState<any[]>(staticActivities)
  const [stats, setStats] = useState<any>(staticKpiData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [
        deptData,
        agentData,
        projectData,
        taskData,
        docData,
        activityData,
        statsData,
      ] = await Promise.all([
        getDepartments(),
        getAgents(),
        getProjects(),
        getTasks(),
        getDocuments(),
        getActivities(20),
        getDashboardStats(),
      ])

      if (deptData.length) setDepartments(deptData)
      if (agentData.length) setAgents(agentData)
      if (projectData.length) setProjects(projectData)
      if (taskData.length) setTasks(taskData)
      if (docData.length) setDocuments(docData)
      if (activityData.length) setActivities(activityData)
      if (statsData) setStats(statsData)
    } catch (err: any) {
      console.error('数据加载失败:', err)
      setError(err?.message || '数据加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 实时订阅
  useEffect(() => {
    if (!isSupabaseConfigured) return

    const taskChannel = subscribeToTasks((payload) => {
      if (payload.eventType === 'INSERT') {
        setTasks((prev) => [payload.new, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        setTasks((prev) => prev.map((t) => (t.id === payload.new.id ? payload.new : t)))
      } else if (payload.eventType === 'DELETE') {
        setTasks((prev) => prev.filter((t) => t.id !== payload.old.id))
      }
    })

    const projectChannel = subscribeToProjects((payload) => {
      if (payload.eventType === 'INSERT') {
        setProjects((prev) => [payload.new, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        setProjects((prev) => prev.map((p) => (p.id === payload.new.id ? payload.new : p)))
      } else if (payload.eventType === 'DELETE') {
        setProjects((prev) => prev.filter((p) => p.id !== payload.old.id))
      }
    })

    const activityChannel = subscribeToActivities((payload) => {
      setActivities((prev) => [payload.new, ...prev])
    })

    return () => {
      unsubscribe(taskChannel)
      unsubscribe(projectChannel)
      unsubscribe(activityChannel)
    }
  }, [])

  // CRUD 方法
  const addProject = useCallback(async (project: any) => {
    const newProject = { ...project, id: `p${Date.now()}`, updatedAt: '刚刚', createdAt: new Date().toISOString() }
    setProjects((prev) => [newProject, ...prev])
    if (isSupabaseConfigured) {
      const { error } = await supabaseCreateProject(project)
      if (error) toast.error('创建项目失败: ' + error.message)
      else toast.success('项目已创建')
    } else {
      toast.success('项目已创建（本地模式）')
    }
  }, [])

  const editProject = useCallback(async (id: string, updates: any) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: '刚刚' } : p)))
    if (isSupabaseConfigured) {
      const { error } = await supabaseUpdateProject(id, updates)
      if (error) toast.error('更新项目失败: ' + error.message)
      else toast.success('项目已更新')
    }
  }, [])

  const removeProject = useCallback(async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    if (isSupabaseConfigured) {
      const { error } = await supabaseDeleteProject(id)
      if (error) toast.error('删除项目失败: ' + error.message)
      else toast.success('项目已删除')
    }
  }, [])

  const addTask = useCallback(async (task: any) => {
    const newTask = { ...task, id: `t${Date.now()}`, createdAt: new Date().toISOString() }
    setTasks((prev) => [newTask, ...prev])
    if (isSupabaseConfigured) {
      const { error } = await supabaseCreateTask(task)
      if (error) toast.error('创建任务失败: ' + error.message)
      else toast.success('任务已创建')
    } else {
      toast.success('任务已创建（本地模式）')
    }
  }, [])

  const editTask = useCallback(async (id: string, updates: any) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
    if (isSupabaseConfigured) {
      const { error } = await supabaseUpdateTask(id, updates)
      if (error) toast.error('更新任务失败: ' + error.message)
      else toast.success('任务已更新')
    }
  }, [])

  const removeTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    if (isSupabaseConfigured) {
      const { error } = await supabaseDeleteTask(id)
      if (error) toast.error('删除任务失败: ' + error.message)
      else toast.success('任务已删除')
    }
  }, [])

  const addDocument = useCallback(async (doc: any) => {
    const newDoc = { ...doc, id: `d${Date.now()}`, updatedAt: '刚刚', createdAt: new Date().toISOString() }
    setDocuments((prev) => [newDoc, ...prev])
    if (isSupabaseConfigured) {
      const { error } = await supabaseCreateDocument(doc)
      if (error) toast.error('创建文档失败: ' + error.message)
      else toast.success('文档已创建')
    } else {
      toast.success('文档已创建（本地模式）')
    }
  }, [])

  const editDocument = useCallback(async (id: string, updates: any) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: '刚刚' } : d)))
    if (isSupabaseConfigured) {
      const { error } = await supabaseUpdateDocument(id, updates)
      if (error) toast.error('更新文档失败: ' + error.message)
      else toast.success('文档已更新')
    }
  }, [])

  const removeDocument = useCallback(async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
    if (isSupabaseConfigured) {
      const { error } = await supabaseDeleteDocument(id)
      if (error) toast.error('删除文档失败: ' + error.message)
      else toast.success('文档已删除')
    }
  }, [])

  const addActivity = useCallback(async (activity: any) => {
    const newActivity = { ...activity, id: `a${Date.now()}`, createdAt: new Date().toISOString() }
    setActivities((prev) => [newActivity, ...prev])
    if (isSupabaseConfigured) {
      await supabaseCreateActivity(activity)
    }
  }, [])

  return {
    departments,
    agents,
    projects,
    tasks,
    documents,
    activities,
    stats,
    loading,
    error,
    refresh: loadData,
    addProject,
    editProject,
    removeProject,
    addTask,
    editTask,
    removeTask,
    addDocument,
    editDocument,
    removeDocument,
    addActivity,
  }
}
